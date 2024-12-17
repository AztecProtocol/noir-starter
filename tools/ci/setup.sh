#!/bin/bash

# Function to check the latest Noir pre-release
check_noir_prerelease() {
    # Fetch the latest pre-release through the GitHub API
    LATEST_PRERELEASE=$(curl -s https://api.github.com/repos/noir-lang/noir/releases \
        | jq -r '.[] | select(.prerelease == true) | .tag_name' | head -n 1)
    
    echo "Latest Noir pre-release: $LATEST_PRERELEASE"
    return "$LATEST_PRERELEASE"
}

# Function to install a specific version of Noir
install_noir_version() {
    VERSION=$1
    echo "Installing Noir version $VERSION"
    
    # Install nargo
    curl -L https://raw.githubusercontent.com/noir-lang/noir/master/installer/install.sh | bash -s -- -v "$VERSION"
}

# Function to create a GitHub Issue upon detecting incompatibility
create_github_issue() {
    VERSION=$1
    ERROR_MSG=$2
    
    if [ -n "$GITHUB_TOKEN" ]; then
        curl -X POST "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues" \
            -H "Authorization: token ${GITHUB_TOKEN}" \
            -H "Accept: application/vnd.github.v3+json" \
            -d "{
                \"title\": \"Incompatibility with Noir ${VERSION}\",
                \"body\": \"An incompatibility was detected while testing with version ${VERSION}:\\n\\n\`\`\`\\n${ERROR_MSG}\\n\`\`\`\"
            }"
    fi
}

# Main logic
main() {
    PRERELEASE=$(check_noir_prerelease)
    install_noir_version "$PRERELEASE"
    
    # Run tests
    if ! npm test; then
        create_github_issue "$PRERELEASE" "Tests failed with version $PRERELEASE"
        exit 1
    fi
}

main
