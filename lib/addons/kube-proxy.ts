import { Construct } from "constructs";
import { CfnAddon, KubernetesVersion } from "aws-cdk-lib/aws-eks";
import { AddOn, ClusterInfo } from "../cluster-info";

// version matrix from
// https://docs.aws.amazon.com/eks/latest/userguide/kube-proxy.html
// support provided for v1.28 and later
const KUBE_PROXY_VERSION_MAP: Map<KubernetesVersion, string> = new Map([
  [KubernetesVersion.V1_33, "v1.33.3-eksbuild.6"],
  [KubernetesVersion.V1_32, "v1.32.6-eksbuild.8"],
  [KubernetesVersion.V1_31, "v1.31.2-eksbuild.3"],
  [KubernetesVersion.V1_30, "v1.30.0-eksbuild.3"],
  [KubernetesVersion.V1_29, "v1.29.0-eksbuild.1"],
  [KubernetesVersion.V1_28, "v1.28.2-eksbuild.2"],
])

export class KubeProxyAddOn implements AddOn {
  readonly name = 'kube-proxy';
  readonly requires = [];
  install(scope: Construct, clusterInfo: ClusterInfo) {
    const config = clusterInfo.addonConfigs?.[this.name] || {};
    const version = config.version || KUBE_PROXY_VERSION_MAP.get(clusterInfo.version);

    if (!version) {
      throw new Error(
        `KubeProxyAddOn: Unsupported Kubernetes version ${clusterInfo.version}` +
        `Please specify the overrideVersion in the addonConfigs.`
      );
    }

    new CfnAddon(scope, 'KubeProxyAddon', {
      clusterName: clusterInfo.name,
      addonName: this.name,
      addonVersion: version,
      configurationValues: config.values,
    })
  }
}
