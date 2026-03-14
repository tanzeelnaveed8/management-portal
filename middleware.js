// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Use jose instead of jsonwebtoken

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
     const path = request.nextUrl.pathname;
     const publicPaths = ['/login', '/register', '/forgot-password'];

     if (publicPaths.includes(path)) {
          return NextResponse.next();
     }

     const accessToken = request.cookies.get('accessToken')?.value;

     if (!accessToken) {
          return NextResponse.redirect(new URL('/login', request.url));
     }

     try {
          // Verify the token using jose
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          const userRole = payload.role;

          // Logged-in user on welcome page: send to their dashboard
          if (path === '/') {
               const dashboardByRole = {
                    CEO: '/ceo',
                    PROJECT_MANAGER: '/project-manager',
                    TEAM_LEAD: '/team-lead',
                    DEVELOPER: '/developer'
               };
               const dashboard = dashboardByRole[userRole] || '/login';
               return NextResponse.redirect(new URL(dashboard, request.url));
          }

          // Define access rules
          const dashboardMapping = {
               '/ceo': 'CEO',
               '/project-manager': 'PROJECT_MANAGER',
               '/team-lead': 'TEAM_LEAD',
               '/developer': 'DEVELOPER'
          };

          // Check if the current path is a restricted dashboard
          for (const [route, requiredRole] of Object.entries(dashboardMapping)) {
               if (path.startsWith(route) && userRole !== requiredRole) {
                    // Redirect unauthorized users to their own dashboard
                    const correctDashboard = Object.keys(dashboardMapping).find(
                         key => dashboardMapping[key] === userRole
                    ) || '/login';

                    return NextResponse.redirect(new URL(correctDashboard, request.url));
               }
          }

          return NextResponse.next();
     } catch (error) {
          // If token is invalid or expired
          return NextResponse.redirect(new URL('/login', request.url));
     }
}

export const config = {
     matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};

// import { NextResponse } from 'next/server';
// import { verifyAccessToken } from './lib/auth/jwt';

// export async function middleware(request) {
//      const path = request.nextUrl.pathname;

//      // Public paths that don't require authentication
//      const publicPaths = ['/login', '/register', '/forgot-password'];
//      if (publicPaths.includes(path)) {
//           return NextResponse.next();
//      }

//      // Get token from cookies
//      const accessToken = request.cookies.get('accessToken')?.value;

//      if (!accessToken) {
//           return NextResponse.redirect(new URL('/login', request.url));
//      }

//      // Verify token
//      const user = verifyAccessToken(accessToken);
//      if (!user) {
//           return NextResponse.redirect(new URL('/login', request.url));
//      }

//      // Add user info to request headers for API routes
//      const requestHeaders = new Headers(request.headers);
//      requestHeaders.set('x-user-id', user.id);
//      requestHeaders.set('x-user-role', user.role);
//      requestHeaders.set('x-user-email', user.email);

     // // Track session start time for dashboard
     // if (path === '/developer' || path.startsWith('/developer/')) {
     //      const sessionStart = request.cookies.get('sessionStart')?.value;
     //      if (!sessionStart) {
     //           requestHeaders.set('x-session-start', Date.now().toString());
     //      }
     // }

//      // Role-based access control
//      const rolePaths = {
//           '/ceo': 'CEO',
//           '/project-manager': 'PROJECT_MANAGER',
//           '/team-lead': 'TEAM_LEAD',
//           '/developer': 'DEVELOPER'
//      };

//      // Check if user is accessing a role-specific path
//      for (const [route, role] of Object.entries(rolePaths)) {
//           if (path.startsWith(route) && user.role !== role) {
//                const dashboardMap = {
//                     'CEO': '/ceo',
//                     'PROJECT_MANAGER': '/project-manager',
//                     'TEAM_LEAD': '/team-lead',
//                     'DEVELOPER': '/developer'
//                };
//                return NextResponse.redirect(new URL(dashboardMap[user.role] || '/', request.url));
//           }
//      }

//      const response = NextResponse.next({
//           request: {
//                headers: requestHeaders,
//           },
//      });

//      // Set session start cookie if not exists
//      if (path === '/developer' && !request.cookies.get('sessionStart')) {
//           response.cookies.set('sessionStart', Date.now().toString(), {
//                httpOnly: true,
//                secure: process.env.NODE_ENV === 'production',
//                sameSite: 'strict',
//                maxAge: 60 * 60 * 24 // 24 hours
//           });
//      }

//      return response;
// }

// export const config = {
//      matcher: [
//           '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
//      ],
// };