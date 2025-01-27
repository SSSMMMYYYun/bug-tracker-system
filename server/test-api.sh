#!/bin/bash

# 设置基础 URL
BASE_URL="http://localhost:5000/api"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 测试函数
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=$4
    
    echo -e "\n${GREEN}Testing $method $endpoint${NC}"
    echo "Request data: $data"
    
    if [ -n "$auth_header" ]; then
        echo "Auth header: $auth_header"
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $auth_header" \
            -d "$data" \
            $BASE_URL$endpoint)
    else
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            $BASE_URL$endpoint)
    fi
    
    echo "Response:"
    echo $response | python -m json.tool
    echo -e "${GREEN}Test completed${NC}\n"
    
    # 如果响应包含 token，提取它
    if [[ $response == *"token"* ]]; then
        token=$(echo $response | python -c "import sys, json; print(json.load(sys.stdin)['token'])")
        echo $token
        return 0
    fi
    return 1
}

# 测试钉钉登录
echo -e "${GREEN}Testing DingTalk Integration APIs${NC}"

# 1. 测试钉钉授权
echo -e "\n${GREEN}1. Testing DingTalk Authorization${NC}"
test_endpoint "POST" "/dingtalk/auth" '{"authCode": "test-auth-code"}'

# 2. 使用测试 token 测试解除绑定
echo -e "\n${GREEN}2. Testing DingTalk Unbind${NC}"
test_endpoint "POST" "/dingtalk/unbind" '{}' "test-token"

# 3. 测试钉钉登录
echo -e "\n${GREEN}3. Testing DingTalk Login${NC}"
test_endpoint "POST" "/dingtalk/login" '{"authCode": "test-auth-code"}'
