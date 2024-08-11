import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import PurchaseReceiptEmail from "@/app/email/PurchaseReceipt"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const resend = new Resend(process.env.EMAIL_SENDER as string)

export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  )
  console.log("Event", event)

  if (event.type === "charge.succeeded") {
    const charge = event.data.object as Stripe.Charge
    const productId = charge.metadata.productId
    const email = charge.billing_details.email
    const pricePaidInCents = charge.amount

    const product = await db.product.findUnique({ where: { id: productId } })
    if (product == null || email == null) {
      return new NextResponse("Bad Request", { status: 400 })
    }

    const userFields = {
      email,
      clerkId: '', // Add a default value for clerkId
      imageUrl: '', // Add a default value for imageUrl
      orders: { create: { productId, pricePaidInCents } },
    }

    const { orders: [order] } = await db.user.upsert({
      where: { email },
      create: userFields,
      update: {
        orders: { create: { productId, pricePaidInCents } },
      },
      select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
    })

    const downloadVerification = await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })

    const emailProduct = {
        name: product.name,
        imagePath: product.imagePath || '', // Provide a default empty string if null
        description: product.description
      };

    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Order Confirmation",
      react: PurchaseReceiptEmail({
        order,
        product:emailProduct,
        downloadVerificationId: downloadVerification.id,
      }),
    })
  }

  return new NextResponse()
}