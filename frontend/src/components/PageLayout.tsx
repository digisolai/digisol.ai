import React from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
} from '@chakra-ui/react';

interface PageLayoutProps {
  title: string;
  leftColumn?: ReactNode;
  centerColumn: ReactNode;
  rightColumn?: ReactNode;
  showLeftColumn?: boolean;
  showRightColumn?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  leftColumn,
  centerColumn,
  rightColumn,
  showLeftColumn = true,
  showRightColumn = true,
}) => {
  // Determine grid template based on which columns to show
  const getGridTemplate = () => {
    if (showLeftColumn && showRightColumn) {
      return { base: '1fr', xl: '1fr 2fr 1fr' };
    } else if (showLeftColumn) {
      return { base: '1fr', lg: '1fr 2fr' };
    } else if (showRightColumn) {
      return { base: '1fr', lg: '2fr 1fr' };
    } else {
      return '1fr';
    }
  };

  return (
    <Box py={4} px={{ base: 0, md: 4 }}>
      <Heading size="lg" color="brand.primary" mb={6}>{title}</Heading>

      <Grid templateColumns={getGridTemplate()} gap={6}>
        {/* Left Column - AI Assistant or other tools */}
        {showLeftColumn && leftColumn && (
          <GridItem>
            <Card h="fit-content">
              {leftColumn}
            </Card>
          </GridItem>
        )}

        {/* Center Column - Main content */}
        <GridItem>
          {centerColumn}
        </GridItem>

        {/* Right Column - Quick Actions & Stats */}
        {showRightColumn && rightColumn && (
          <GridItem>
            <VStack spacing={6} align="stretch">
              {rightColumn}
            </VStack>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
};

// Helper components for consistent sections
export const SectionCard: React.FC<{
  title: string;
  children: ReactNode;
  actionButton?: ReactNode;
}> = ({ title, children, actionButton }) => (
  <Card>
    <CardHeader>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="md">{title}</Heading>
        {actionButton}
      </Box>
    </CardHeader>
    <CardBody>
      {children}
    </CardBody>
  </Card>
);

export const SideCard: React.FC<{
  title: string;
  children: ReactNode;
}> = ({ title, children }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{title}</Heading>
    </CardHeader>
    <CardBody>
      {children}
    </CardBody>
  </Card>
); 