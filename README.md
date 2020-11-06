#oxy prj
### main contract
```
 UniswapV2Route.sol
 UniswapV2Factory.sol
 OxyMain.sol
```

npx hardhat run --network rinkeby ./scripts/deploy_oxytoken.ts

npx hardhat run --network rinkeby ./scripts/deploy_oxychef.ts

npx hardhat verify --network rinkeby --constructorArgs [] 


#Swap for centos 7.x

sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

sudo vim /etc/fstab
/swapfile   swap    swap    sw  0   0

sudo sysctl vm.swappiness=50
