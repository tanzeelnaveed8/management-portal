// lib/auth/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export function generateTokens(user) {
     const accessToken = jwt.sign(
          {
               id: user.id,
               email: user.email,
               role: user.role,
               name: user.name
          },
          JWT_SECRET,
          { expiresIn: '1d' } // Note: 1 day expiration for access token
     );

     const refreshToken = jwt.sign(
          { id: user.id },
          JWT_REFRESH_SECRET,
          { expiresIn: '7d' }
     );

     return { accessToken, refreshToken };
}

export function verifyAccessToken(token) {
     try {
          return jwt.verify(token, JWT_SECRET);
     } catch (error) {
          return null;
     }
}

export function verifyRefreshToken(token) {
     try {
          return jwt.verify(token, JWT_REFRESH_SECRET);
     } catch (error) {
          return null;
     }
}