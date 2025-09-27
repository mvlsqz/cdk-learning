import { Cluster, KubernetesVersion } from "aws-cdk-lib/aws-eks"

export type Values = Record<string, any>

/* 
  * ClusterInfo interface will be used to store cluster information
  * that later can be passed to add-ons for installation
  */

export interface ClusterInfo {
  readonly cluster: Cluster;
  readonly version: KubernetesVersion;
  readonly name: string;
  readonly region: string;
  readonly account: string;
  readonly addonConfigs?: Values;
}

/*
* AddOn interface will be used to define add-ons information
*/
export interface AddOn {
  // Unique name for the add-on
  readonly name: string;

  // List of add-on names this one depends on.
  readonly requires?: string[]

  // install is blueprint that has to be implemented for each add-on to install it
  install(scope: any, clusterInfo: ClusterInfo): void;
}
