import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { KubectlV33Layer } from '@aws-cdk/lambda-layer-kubectl-v33'
import { InstanceType, Vpc } from "aws-cdk-lib/aws-ec2";
import {
  ManagedPolicy,
  Role,
  ServicePrincipal,
  User,
} from "aws-cdk-lib/aws-iam";

import {
  Cluster,
  ClusterLoggingTypes,
  FargateProfile,
  IpFamily,
  KubernetesVersion,
  NodegroupAmiType,
} from 'aws-cdk-lib/aws-eks'

import {
  installAddOns,
  KubeProxyAddOn,
  CoreDnsAddOn,
  VpcCniAddOn,
  EksPodIdentityAgentAddOn,
  MetricsServerAddOn
} from './addons/'

import { ClusterInfo } from './cluster-info';

// Cluster version
const clusterVersion = KubernetesVersion.V1_33
// Cluster logging configuration
const clusterLogging = [
  ClusterLoggingTypes.AUDIT,
]

// Cluster instances options
const defaultInstanceTypes = [
  't3.small'
]

export class EksStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Context variables
    const adminUsersArns: string[] = this.node.tryGetContext('adminUsersArns') || [];
    const env: string = this.node.tryGetContext('env'); // must be provided
    const infrastructureOwner: string = this.node.tryGetContext('infrastructureOwner');
    const availabilityZones: string[] = this.node.tryGetContext('availabilityZones') || ['us-east-1a', 'us-east-1b'];
    const instanceTypes: string[] = this.node.tryGetContext('instanceTypes') || defaultInstanceTypes;

    // Data from context variables
    const eksNodesInstanceTypes: InstanceType[] = instanceTypes.map(type => new InstanceType(type));

    // Creating a VPC for the EKS cluster within the specified availability zones
    const vpc = new Vpc(this, `${infrastructureOwner}-${env}-EksClusterVpc-${props.env?.region}`, {
      availabilityZones: availabilityZones,
      vpcName: `${env}-EksClusterVpc`,
    })

    // Creating the EKS cluster control plane without node group
    const cluster = new Cluster(this, `${infrastructureOwner}-${env}-EksClusterControlPlane-${props.env?.region}`, {
      vpc: vpc,
      clusterName: `${infrastructureOwner}-${env}-EksClusterControlPlane-${props.env?.region}`,
      defaultCapacity: 0,
      version: clusterVersion,
      kubectlLayer: new KubectlV33Layer(this, 'KubectlLayer'),
      ipFamily: IpFamily.IP_V4,
      clusterLogging: clusterLogging,
    })

    // Installing core add-ons to the EKS control plane
    const clusterInfo: ClusterInfo = {
      cluster: cluster,
      version: clusterVersion,
      name: cluster.clusterName,
      region: this.region,
      account: this.account
    }

    installAddOns(this, clusterInfo, [
      new KubeProxyAddOn(),
      new CoreDnsAddOn(),
      new VpcCniAddOn(),
      new EksPodIdentityAgentAddOn(),
      new MetricsServerAddOn()
    ])

    // Provission node group for the EKS control plane
    cluster.addNodegroupCapacity(`${infrastructureOwner}-${env}-EksNodeGroup-${props.env?.region}`, {
      amiType: NodegroupAmiType.AL2023_X86_64_STANDARD,
      instanceTypes: eksNodesInstanceTypes,
      desiredSize: 2,
      minSize: 2,
      maxSize: 3,
      diskSize: 20,
      nodeRole: new Role(this, `${infrastructureOwner}-${env}-NodeGroupRole-${props.env?.region}`, {
        roleName: `${infrastructureOwner}-${env}-NodeGroupRole-${props.env?.region}`,
        assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
        managedPolicies: [
          "AmazonEKSWorkerNodePolicy",
          "AmazonEC2ContainerRegistryReadOnly",
          "AmazonEKS_CNI_Policy",
        ].map((policy) => ManagedPolicy.fromAwsManagedPolicyName(policy))
      })
    });

    // Mapping adminUsersArns list to system:masters in the cluster
    adminUsersArns.forEach(userArn => {
      const adminUser = User.fromUserArn(this, 'AdminUser', userArn);

      cluster.awsAuth.addUserMapping(adminUser, { groups: ['system:masters'] });
    })

    // leting Fargate to manage the infrastructure
    new FargateProfile(this, `${infrastructureOwner}-${env}-EksFargateProfile-${props.env?.region}`, {
      cluster: cluster,
      selectors: [{ namespace: 'default' }, { namespace: 'kube-system' }],
    });
  }
}
