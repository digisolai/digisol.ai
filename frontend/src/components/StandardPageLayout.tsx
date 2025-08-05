import React from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiHome } from 'react-icons/fi';

interface StandardPageLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  children: ReactNode;
  maxW?: string;
  px?: number | object;
  py?: number | object;
}

export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  title,
  subtitle,
  breadcrumbItems = [],
  children,
  maxW = "full",
  px = { base: 4, md: 6 },
  py = { base: 4, md: 6 },
}) => {
  const textColor = 'brand.primary';

  return (
    <Container maxW={maxW} px={px} py={py}>
      {/* Breadcrumb */}
      {breadcrumbItems.length > 0 && (
        <Breadcrumb mb={4}>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <Icon as={FiHome} mr={2} />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={index} isCurrentPage={index === breadcrumbItems.length - 1}>
              <BreadcrumbLink href={item.href}>
                {item.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}

      {/* Page Header */}
      <VStack align="start" spacing={2} mb={6}>
        <Heading size="lg" color={textColor}>
          {title}
        </Heading>
        {subtitle && (
          <Text color="gray.600" fontSize="md">
            {subtitle}
          </Text>
        )}
      </VStack>

      {/* Page Content */}
      <Box>
        {children}
      </Box>
    </Container>
  );
};

// Standard page header component for pages with action buttons
interface StandardPageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({
  title,
  subtitle,
  actionButton,
}) => {
  const textColor = 'brand.primary';

  return (
    <HStack justify="space-between" align="start" mb={6}>
      <VStack align="start" spacing={2}>
        <Heading size="lg" color={textColor}>
          {title}
        </Heading>
        {subtitle && (
          <Text color="gray.600">
            {subtitle}
          </Text>
        )}
      </VStack>
      {actionButton && (
        <Box>
          {actionButton}
        </Box>
      )}
    </HStack>
  );
}; 