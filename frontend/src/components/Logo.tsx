// frontend/src/components/Logo.tsx
import React from 'react';
import { Box, Image } from '@chakra-ui/react';

interface LogoProps {
  size?: number;
  logoUrl?: string | null;
}

export const Logo: React.FC<LogoProps> = ({ size = 100, logoUrl }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Image
        src={logoUrl || "/src/assets/images/1752705893857.jpg"}
        alt="DigiSol.AI Logo"
        width={size}
        height={size}
        objectFit="contain"
      />
    </Box>
  );
};

export default Logo;