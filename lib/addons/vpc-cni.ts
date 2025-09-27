import { Construct } from "constructs";
import { CfnAddon, KubernetesVersion } from "aws-cdk-lib/aws-eks";
import { AddOn, ClusterInfo } from "../cluster-info";

const VPC_CNI_VERSION_MAP: Map<KubernetesVersion, string> = new Map([
  [KubernetesVersion.V1_33, "v1.20.2-eksbuild.1"],
  [KubernetesVersion.V1_32, "v1.20.2-eksbuild.1"],
  [KubernetesVersion.V1_31, "v1.20.2-eksbuild.1"],
  [KubernetesVersion.V1_30, "v1.20.2-eksbuild.1"],
  [KubernetesVersion.V1_29, "v1.20.2-eksbuild.1"],
  [KubernetesVersion.V1_28, "v1.20.2-eksbuild.1"],
])

export class VpcCniAddOn implements AddOn {
  readonly name = 'vpc-cni';
  readonly requires = ['kube-proxy', 'coredns'];

  install(scope: Construct, clusterInfo: ClusterInfo) {
    const config = clusterInfo.addonConfigs?.[this.name] || {};
    const version = config.version || VPC_CNI_VERSION_MAP.get(clusterInfo.version);

    if (!version) {
      `VpcCniAddOn: Unsupported Kubernetes version ${clusterInfo.version}` +
        `Please specify the overrideVersion if you know that there is a supported version.`
    }

    new CfnAddon(scope, 'VpcCniAddOn', {
      clusterName: clusterInfo.name,
      addonName: this.name,
      addonVersion: version,
      configurationValues: config.values,
    })
  }
}
