import { Construct } from "constructs";
import { CfnAddon, KubernetesVersion } from "aws-cdk-lib/aws-eks";
import { AddOn, ClusterInfo } from "../cluster-info";

const POD_IDENTITYAVENT_VERSION_MAP: Map<KubernetesVersion, string> = new Map([
  [KubernetesVersion.V1_33, "v1.3.8-eksbuild.2"],
  [KubernetesVersion.V1_32, "v1.3.8-eksbuild.2"],
  [KubernetesVersion.V1_31, "v1.3.8-eksbuild.2"],
  [KubernetesVersion.V1_30, "v1.3.8-eksbuild.2"],
  [KubernetesVersion.V1_29, "v1.3.8-eksbuild.2"],
  [KubernetesVersion.V1_28, "v1.3.8-eksbuild.2"],
])

export class EksPodIdentityAgentAddOn implements AddOn {
  readonly name = 'eks-pod-identity-agent';
  readonly requires = [];

  install(scope: Construct, clusterInfo: ClusterInfo) {
    const config = clusterInfo.addonConfigs?.[this.name] || {};
    const version = config.version || POD_IDENTITYAVENT_VERSION_MAP.get(clusterInfo.version);

    if (!version) {
      `EksPodIdentityAgentAddOn: Unsupported Kubernetes version ${clusterInfo.version}` +
        `Please specify the overrideVersion if you know that there is a supported version.`
    }

    new CfnAddon(scope, 'EksPodIdentityAgentAddOn', {
      clusterName: clusterInfo.name,
      addonName: this.name,
      addonVersion: version,
      configurationValues: config.values,
    })
  }
} 
