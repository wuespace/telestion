#!/usr/bin/env python3
import os
import warnings
import argparse

from behave.__main__ import main as run_behave

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the Telestion Backend Service Behavior Tests')
    parser.add_argument('path', type=str, nargs='?',
                        help='The path to the testbed folder containing a Dockerfile. '
                             'Can also be set via the "TELESTION_TESTBED_PATH" environment variable.')
    parser.add_argument('-v', '--verbose', action='store_true',
                        help='Verbose output for debugging purposes. Primarily for developing the tests themselves.')
    args = parser.parse_args()

    if args.path:  # Set from CLI (overwrites environment variable)
        os.environ["TELESTION_TESTBED_PATH"] = args.path

    if args.verbose:
        os.environ["VERBOSE"] = "true"
    else:
        # Disable NotOpenSSL warning: https://github.com/urllib3/urllib3/issues/3020
        warnings.filterwarnings("ignore", module="urllib3")

    if "TELESTION_TESTBED_PATH" not in os.environ:  # No path set
        warnings.warn("Please provide the path to the testbed folder containing a Dockerfile.")
        exit(1)

    features_path = os.path.dirname(os.path.realpath(__file__))
    print(f"Running tests from {features_path} for testbed at {os.environ['TELESTION_TESTBED_PATH']}")

    run_behave(features_path)
