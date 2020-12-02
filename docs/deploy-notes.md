
npx hardhat run --network rinkeby ./scripts/deploy_oxytoken.ts

npx hardhat run --network rinkeby ./scripts/deploy_oxychef.ts

FEE_TO_SETTER=0x42e225fA5A8E40B1F2446Ed8558aBf5a7bF4db84 npx hardhat run --network rinkeby ./scripts/deploy_uniswap_factory.ts
FEE_TO_SETTER=0x42e225fA5A8E40B1F2446Ed8558aBf5a7bF4db84 npx hardhat run --network mainnet ./scripts/deploy_uniswap_factory.ts

FACTORY_ADDR= NETWORK=rinkeby npx hardhat run --network rinkeby ./scripts/deploy_uniswap_route.ts
FACTORY_ADDR= NETWORK=mainnet npx hardhat run --network mainnet ./scripts/deploy_uniswap_route.ts

NETWORK=rinkeby npx hardhat run --network rinkeby ./scripts/deploy_oxytoken.ts
NETWORK=mainnet npx hardhat run --network mainnet ./scripts/deploy_oxytoken.ts

npx hardhat verify --network rinkeby --constructorArgs [] 


#Swap for centos 7.x

sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

sudo vim /etc/fstab
/swapfile   swap    swap    sw  0   0

sudo sysctl vm.swappiness=70
