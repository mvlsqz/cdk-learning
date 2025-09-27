import { Construct } from "constructs";
import { CfnAddon, KubernetesVersion } from "aws-cdk-lib/aws-eks";
import { AddOn, ClusterInfo } from "../cluster-info";

const COREDNS_VERSION_MAP: Map<KubernetesVersion, string> = new Map([
  [KubernetesVersion.V1_33, "v1.12.4-eksbuild.1"],
  [KubernetesVersion.V1_32, "v1.11.4-eksbuild.22"],
  [KubernetesVersion.V1_31, "v1.11.4-eksbuild.22"],
  [KubernetesVersion.V1_30, "v1.11.4-eksbuild.22"],
  [KubernetesVersion.V1_29, "v1.11.4-eksbuild.22"],
  [KubernetesVersion.V1_28, "v1.10.1-eksbuild.38"],
])

export class CoreDnsAddOn implements AddOn {
  readonly name = 'coredns';
  readonly requires = [];

  install(scope: Construct, clusterInfo: ClusterInfo) {
    const config = clusterInfo.addonConfigs?.[this.name] || {};
    const version = config.version || COREDNS_VERSION_MAP.get(clusterInfo.version);

    if (!version) {
      `CoreDnsAddOn: Unsupported Kubernetes version ${clusterInfo.version}` +
        `Please specify the overrideVersion if you know that there is a supported version.`
    }

    new CfnAddon(scope, 'CoreDnsAddon', {
      clusterName: clusterInfo.name,
      addonName: this.name,
      addonVersion: version,
      configurationValues: config.values,
    })
  }
} 
