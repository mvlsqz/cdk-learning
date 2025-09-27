import { ClusterInfo, AddOn } from "../cluster-info";

/**
 * NOTE: main logic to install the add-on
 */

export function installAddOns(scope: any, clusterInfo: ClusterInfo, addOns: AddOn[]) {
  const resolved: AddOn[] = [];
  const unresolved: Set<string> = new Set();

  function resolve(addOn: AddOn) {
    unresolved.add(addOn.name);

    // Check if add-on has dependencies
    if (addOn.requires) {

      // Loop trhough dependency
      for (const depName of addOn.requires) {

        // check in to the resolved and close the loop if already resolved
        if (resolved.find(a => a.name == depName)) continue;

        // check in the unresolved set to detect circular dependencies and fail
        if (unresolved.has(depName)) {
          throw new Error(`Circular dependency found: ${addOn.name} -> ${depName}`);
        }

        // Check for the dependecy is listed in the AddOns list
        const depAddOn = addOns.find(a => a.name == depName);

        // If not defined trow error due missing dependency
        if (!depAddOn) {
          throw new Error(`Dependency "${depName}" required by "${addOn.name}" not found in addOns list.`);
        }

        // Resolve depdendencies fo the dependency if any
        resolve(depAddOn);
      }
    }

    // add the add-on to the resolved list if not already present
    if (!resolved.includes(addOn)) {
      resolved.push(addOn);
    }

    // remove from the unresolved set
    unresolved.delete(addOn.name);
  }

  // put dependency in order
  for (const addOn of addOns) {
    if (!resolved.includes(addOn)) {
      resolve(addOn);
    }
  }

  // install the add-ons in order
  for (const addOn of resolved) {
    addOn.install(scope, clusterInfo);
  }
}
