#!/usr/bin/env node

import { App } from 'aws-cdk-lib';
import { EksStack } from '../lib/eks-stack';

const app = new App();

new EksStack(app, 'UatEksStack', { env: { region: 'us-east-1' } });
