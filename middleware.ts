// import { clerkMiddleware } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import { currentUser } from "@clerk/nextjs/server"

// export default clerkMiddleware(async (auth, request) => {
//   const { sessionClaims } = auth();
//   //const user = await currentUser()
//   // console.log('MiddleWare Org', sessionClaims?.metadata as { role?: string })?.role
  
// const isAdmin = (sessionClaims?.publicMetadata as { role?: string })?.role === "admin";


//   console.log('Adnin role', isAdmin)
//   // Protect admin routes
//   if (request.nextUrl.pathname.startsWith("/admin")) {
//     if (!isAdmin) {
//       return NextResponse.redirect(new URL("/signin", request.url));
//     } 
//   }

//   // Allow access to all other routes
//   return NextResponse.next();
// });


// export const config = {
//   matcher: [
//     "/((?!.*\\..*|_next|signin).*)",
//     "/",
//     "/(api|trpc)(.*)"
//   ],
// };


import { clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server';


const isProtected = createRouteMatcher([
  '/admin(.*)',
  '/api'
])

export default clerkMiddleware(async (auth, request) => {
if(isProtected(request)){
  auth().protect()
}
});


export const config = {
  matcher:["/((?!.*\\..*|_next|signin).*)"],
}