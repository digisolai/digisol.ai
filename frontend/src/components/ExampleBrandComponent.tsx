import { Box, Button, Text, Card, CardBody, VStack, HStack } from '@chakra-ui/react';
import { useTheme } from '../hooks/useTheme';

export const ExampleBrandComponent = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const handleUpdateTheme = () => {
    // Example of updating theme colors
    updateTheme({
      primary_color: '#FF6B6B',
      accent_color: '#4ECDC4',
      brand_name: 'Example Brand',
    });
  };

  const handleResetTheme = () => {
    resetTheme();
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Display current theme info */}
        <Card className="card-brand">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold" className="text-brand-primary">
                Current Brand Theme
              </Text>
              
              <HStack spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600">Brand Name:</Text>
                  <Text fontWeight="medium">{theme?.brand_name || 'Not set'}</Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600">Primary Color:</Text>
                  <HStack spacing={2}>
                    <Box 
                      w="20px" 
                      h="20px" 
                      borderRadius="full" 
                      bg={theme?.primary_color || '#1F4287'}
                      border="1px solid"
                      borderColor="gray.300"
                    />
                    <Text fontSize="sm">{theme?.primary_color || '#1F4287'}</Text>
                  </HStack>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600">Accent Color:</Text>
                  <HStack spacing={2}>
                    <Box 
                      w="20px" 
                      h="20px" 
                      borderRadius="full" 
                      bg={theme?.accent_color || '#FFC300'}
                      border="1px solid"
                      borderColor="gray.300"
                    />
                    <Text fontSize="sm">{theme?.accent_color || '#FFC300'}</Text>
                  </HStack>
                </Box>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Theme controls */}
        <HStack spacing={4}>
          <Button 
            className="btn-brand-primary"
            onClick={handleUpdateTheme}
          >
            Update Theme Colors
          </Button>
          
          <Button 
            className="btn-brand-accent"
            onClick={handleResetTheme}
          >
            Reset to Default
          </Button>
        </HStack>

        {/* Example of using brand-themed components */}
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold" className="text-brand-primary">
            Brand-Themed Components
          </Text>
          
          <Card className="card-brand">
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Text className="text-brand-primary">
                  This card uses brand-themed styling
                </Text>
                <Text fontSize="sm" color="gray.600">
                  The border and hover effects automatically use your brand colors
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <HStack spacing={3}>
            <span className="badge-brand-primary">Primary Badge</span>
            <span className="badge-brand-accent">Accent Badge</span>
          </HStack>

          <Box className="alert-brand-info">
            <Text fontSize="sm">
              This is an info alert using brand colors
            </Text>
          </Box>

          <Box className="alert-brand-success">
            <Text fontSize="sm">
              This is a success alert using brand colors
            </Text>
          </Box>

          <Box className="alert-brand-warning">
            <Text fontSize="sm">
              This is a warning alert using brand colors
            </Text>
          </Box>
        </VStack>

        {/* CSS Custom Properties demo */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">
                CSS Custom Properties Demo
              </Text>
              <Text fontSize="sm" color="gray.600">
                These elements use CSS custom properties that automatically update when the theme changes:
              </Text>
              
              <Box 
                p={4} 
                borderRadius="md"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                <Text>Primary Color Background</Text>
              </Box>
              
              <Box 
                p={4} 
                borderRadius="md"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white'
                }}
              >
                <Text>Accent Color Background</Text>
              </Box>
              
              <Text 
                style={{
                  fontFamily: 'var(--font-family-heading)',
                  color: 'var(--color-primary)'
                }}
              >
                This text uses the brand heading font and primary color
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}; 