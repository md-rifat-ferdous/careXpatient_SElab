import jwt from 'jsonwebtoken';

export const generateToken = (id: string, email: string): string => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};
