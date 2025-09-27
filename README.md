# CDK Learning Project

This is a simple AWS CDK project to demonstrate how to create a basic
infrastructure using AWS CDK in TypeScript.

## ckd.json for context variables
a `cdk.json` file is used to store context variables for different environments,
it resides within the folder environment for specific customization.
``` bash
dev/cdk.json # to provide contest variables for the dev environment
uat/cdk.json # to provide contest variables for the uat environment
```

## Useful commands

* `npm run cdk-dev`   run `cdk` commands for the `dev` environment it expects `synth`,`diff``, `deploy` or `destroy` as last position argument
* `npm run cdk-uat`   run `cdk` commands for the UAT environment it it expects `synth`,`diff``, `deploy` or `destroy` as last position argument
* `npx cdk deploy`  deploy infrastructure from the bin (default) stack
* `npx cdk diff`    compare deployed stack with current state from the (default) stack
* `npx cdk synth`   emits the synthesized CloudFormation template from the (default) stack

## Example
```bash
npm run cdk-dev synth # synthesize the CloudFormation template for the dev environment
npm run cdk-dev deploy # deploy the stack to the dev environment
npm run cdk-dev destroy # deploy the stack to the dev environment
```
