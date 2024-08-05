import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { wait } from "@/assets/utility/slowFunc";



// /**
//  * Retrieves sales data from the database, including the total amount of sales and the number of sales.
//  *
//  * @returns An object containing the total sales amount and the number of sales.
//  */

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  //await wait(2000)
  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

// async function getCustomersData() {
//     const usercount = await db.user.count()
//     const orderData = await db.order.aggregate({
//     _sum: {pricePaidInCents: true},
// })
// }

async function getCustomersData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);

  return {
    userCount,
    averagValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getProductsData() {
  const [acvtiveCount, inActiveCount] = await Promise.all([
    db.product.count({
      where: {
        isAvailableForPurchase: true,
      },
    }),
    db.product.count({
      where: {
        isAvailableForPurchase: false,
      },
    }),
  ]);

  return {
    activeCount: acvtiveCount,
    inactiveCount: inActiveCount,
    totalCount: acvtiveCount + inActiveCount,
  };
}

export default async function AdminHomePage() {
  const [salesData, UserData, productData] = await Promise.all([
    getSalesData(),
    getCustomersData(),
    getProductsData(),
  ]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashBoardCard
          title="Sales"
          subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
          content={formatCurrency(salesData.amount)}
        />
        <DashBoardCard
          title="Customers"
          subtitle={`${formatCurrency(
            UserData.averagValuePerUser
          )} Average Value`}
          content={formatNumber(UserData.userCount)}
        />
        <DashBoardCard
          title="Active Products"
          subtitle={`${formatNumber(productData.inactiveCount)} Inactive`}
          content={formatNumber(productData.activeCount)}
        />
      </div>
    </>
  );
}

interface DashBoardCardProps {
  title: string;
  subtitle: string;
  content: string;
}

function DashBoardCard({ title, subtitle, content }: DashBoardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
