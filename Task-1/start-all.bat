@echo off
echo ===================================
echo   Resetting EthioMarket Database
echo ===================================
echo.

echo Deleting all data from MongoDB...
mongosh ethiomarket --eval "db.users.deleteMany({}); db.products.deleteMany({}); db.orders.deleteMany({}); db.carts.deleteMany({}); db.reviews.deleteMany({}); console.log('All collections cleared!')"

echo.
echo Deleting uploaded images...
del /q C:\Users\User\Desktop\ethiomarket\server\uploads\products\*.* 2>nul
del /q C:\Users\User\Desktop\ethiomarket\server\uploads\profiles\*.* 2>nul

echo.
echo Creating new admin user...
cd C:\Users\User\Desktop\ethiomarket\server
npm run seed

echo.
echo ===================================
echo   Reset Complete!
echo.
echo   Admin Login:
echo   Email: admin@ethiomarket.com
echo   Password: Admin@123456
echo ===================================
pause