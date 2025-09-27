import { Construct } from "constructs";
import { CfnAddon, KubernetesVersion } from "aws-cdk-lib/aws-eks";
import { AddOn, ClusterInfo } from "../cluster-info";

const METRICS_SERVER_VERSION_MAP: Map<KubernetesVersion, string> = new Map([
  [KubernetesVersion.V1_33, "v0.8.0-eksbuild.2"],
  [KubernetesVersion.V1_32, "v0.8.0-eksbuild.2"],
  [KubernetesVersion.V1_31, "v0.8.0-eksbuild.2"],
  [KubernetesVersion.V1_30, "v0.8.0-eksbuild.2"],
  [KubernetesVersion.V1_29, "v0.8.0-eksbuild.2"],
  [KubernetesVersion.V1_28, "v0.8.0-eksbuild.2"],
])

export class MetricsServerAddOn implements AddOn {
  readonly name = 'metrics-server';
  readonly requires = [];

  install(scope: Construct, clusterInfo: ClusterInfo) {
    const config = clusterInfo.addonConfigs?.[this.name] || {};
    const version = config.version || METRICS_SERVER_VERSION_MAP.get(clusterInfo.version);

    if (!version) {
      `MetricsServerAddOn: Unsupported Kubernetes version ${clusterInfo.version}` +
        `Please specify the overrideVersion if you know that there is a supported version.`
    }

    new CfnAddon(scope, 'MetricsServerAddOn', {
      clusterName: clusterInfo.name,
      addonName: this.name,
      addonVersion: version,
      configurationValues: config.values,
    })
  }
} 
