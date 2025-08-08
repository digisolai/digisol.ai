// frontend/src/components/Layout.tsx
import type { ReactNode } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Text,
  Spacer,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiMail,
  FiUsers,
  FiZap,
  FiGrid,
  FiBarChart2,
  FiSettings,
  FiBriefcase,
  FiLayers,
  FiImage, // FiImage icon for Design Studio
  FiDollarSign, // FiDollarSign icon for Budgeting
  FiCpu, // FiCpu icon for AI Overview
  FiInfo, // FiInfo icon for About
  FiBookOpen, // FiBookOpen icon for Learning Center
  FiFileText, // FiFileText icon for Templates
  FiCreditCard, // FiCreditCard icon for Billing
  FiFolder, // FiFolder icon for Project Management
  FiMenu, // FiMenu icon for mobile menu
  FiLogOut, // FiLogOut icon for logout
  FiUser, // FiUser icon for user menu
} from "react-icons/fi";
import { Logo } from "./Logo"; // Corrected relative path from Layout to Logo
import SubscriptionStatus from "./SubscriptionStatus"; // Import the subscription status component

import '../styles/theme.css';

// Define the navigation links for the sidebar
const getNavLinks = () => {
  const baseLinks = [
    { label: "Dashboard", icon: FiHome, href: "/dashboard" },
    { label: "Campaigns", icon: FiMail, href: "/campaigns" },
    { label: "Contacts", icon: FiUsers, href: "/contacts" },
    { label: "Automations", icon: FiZap, href: "/automations" },
    { label: "Brand Hub", icon: FiGrid, href: "/brand-hub" },
    { label: "Design Studio", icon: FiImage, href: "/design-studio" },
    { label: "Templates", icon: FiFileText, href: "/marketing-templates" },
    { label: "Analytics", icon: FiBarChart2, href: "/analytics" },
    { label: "AI Overview", icon: FiCpu, href: "/ai-overview" },
    { label: "Project Management", icon: FiFolder, href: "/projects" },
    { label: "Reports", icon: FiBarChart2, href: "/reports" },
    { label: "Integrations", icon: FiLayers, href: "/integrations" },
    { label: "Budgeting", icon: FiDollarSign, href: "/budgeting" },
    { label: "Billing", icon: FiCreditCard, href: "/billing" },
  ];

  // Add remaining links
  baseLinks.push(
    { label: "Learning & Info Center", icon: FiBookOpen, href: "/learning-center" },
    { label: "About", icon: FiInfo, href: "/about" },
    { label: "Settings", icon: FiSettings, href: "/settings" }
  );

  return baseLinks;
};

// Import AuthContext to check user subscription
import { useAuth } from '../hooks/useAuth';

// Helper function to check if user has client portal access
const useClientPortalAccess = () => {
  const { user } = useAuth();
  
  // Superusers always have access
  if (user?.is_superuser) return true;
  
  // Check if user has a subscription with client portal features
  // This would need to be implemented based on your subscription logic
  // For now, return true for testing
  return true;
};

// Layout component definition
export const Layout = ({ children }: { children: ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation(); // Get current location
  const { user } = useAuth(); // Get user from auth context

  // Helper function to determine if a link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    
    // For nested routes, check if the current path starts with the link href
    // This handles cases like /organization/users highlighting /organization
    if (location.pathname.startsWith(href)) {
      return true;
    }
    
    // For exact matches
    return location.pathname === href;
  };

  // Get navigation links
  const navLinks = getNavLinks();

     // Content for the sidebar (used in both fixed sidebar and mobile drawer)
   const sidebarContent = (
     <VStack
       align="stretch"
       spacing={2}
       h="100vh"
       bg="brand.primary" // Using brand color
       color="white"
       py={4}
       px={3}
       w={{ base: "full", md: "280px" }} // Fixed width for sidebar
       overflow="auto" // Allow scrolling in sidebar
     >

       {/* Navigation Links */}
       <Text fontSize="xs" fontWeight="bold" color="brand.accent" px={3} mb={1}>
         NAVIGATION
       </Text>
       {navLinks.map((link) => (
         <NavItem
           key={link.label}
           icon={link.icon}
           href={link.href}
           active={isLinkActive(link.href)}
         >
           {link.label}
         </NavItem>
       ))}
       {(user?.is_superuser || user?.is_tenant_admin) && (
         <NavItem
           icon={FiBriefcase}
           href="/my-clients"
           active={isLinkActive("/my-clients")}
         >
           My Clients
         </NavItem>
       )}
       
       <Spacer /> {/* Pushes content to the top */}
       
       {/* Subscription Status - Only show on desktop to save mobile space */}
       <Box display={{ base: "none", md: "block" }} px={3} py={4}>
         <SubscriptionStatus />
       </Box>
       
                {/* Sign Out at the bottom */}
         <Box mt="auto" pt={4} borderTop="1px solid" borderColor="rgba(255,255,255,0.1)">
           <Button
             variant="ghost"
             color="white"
             size="sm"
             w="full"
             justifyContent="flex-start"
             px={3}
             _hover={{ bg: "rgba(255,255,255,0.1)" }}
             leftIcon={<FiLogOut />}
             onClick={() => {
               localStorage.removeItem('access_token');
               localStorage.removeItem('refresh_token');
               window.location.href = '/login';
             }}
           >
             Sign Out
           </Button>
         </Box>
     </VStack>
   );

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Top Header Bar */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={200}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={4}
        py={3}
        display={{ base: "block", md: "block" }}
        boxShadow="sm"
        h="80px"
      >
        <Flex justify="space-between" align="center" h="full">
          {/* Left side - Logo and Mobile Menu */}
          <HStack spacing={4}>
            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<FiMenu />}
              onClick={onOpen}
              variant="ghost"
              aria-label="Open menu"
            />
            
            {/* Logo */}
            <Box>
              <Logo size={50} />
            </Box>
            
            {/* Page Title */}
            <Text fontSize="lg" fontWeight="bold" color="brand.primary" display={{ base: "none", md: "block" }}>
              DigiSol<Text as="span" color="brand.accent">.AI</Text>
            </Text>
          </HStack>

          {/* Right side - User actions */}
          <HStack spacing={4}>
            {/* Subscription Status Indicator - Mobile only */}
            <Box display={{ base: "block", md: "none" }}>
              <Button
                variant="ghost"
                size="sm"
                color="brand.accent"
                _hover={{ bg: "gray.100" }}
                onClick={() => window.location.href = '/billing'}
              >
                <FiCreditCard />
              </Button>
            </Box>
            
            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                color="gray.600"
                _hover={{ bg: "gray.100" }}
                leftIcon={<FiUser />}
              >
                {user?.name || user?.email || 'User'}
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiSettings />} as={RouterLink} to="/settings">
                  Settings
                </MenuItem>
                <MenuItem icon={<FiUser />} as={RouterLink} to="/profile">
                  Profile
                </MenuItem>
                <MenuItem icon={<FiCreditCard />} as={RouterLink} to="/billing">
                  Billing
                </MenuItem>
                <MenuItem 
                  icon={<FiLogOut />} 
                  color="red.500"
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                  }}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="80px"> {/* Add top padding for header */}
        {/* Fixed Sidebar for Desktop */}
        <Box 
          display={{ base: "none", md: "block" }}
          position="fixed"
          top="80px" // Start below the header
          left={0}
          h="calc(100vh - 80px)" // Full height minus header
          zIndex={150} // Below header but above content
        >
          {sidebarContent}
        </Box>
        
        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody p={0}>
              {sidebarContent}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        
        {/* Main Content Area */}
        <Box 
          flex="1" 
          ml={{ base: 0, md: "280px" }} // Offset for fixed sidebar
          h="calc(100vh - 80px)" // Full height minus header
          overflow="auto" // Allow scrolling within content area
        >
          <Box p={4}>
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

// Helper component for navigation items
function NavItem({ icon: Icon, children, href, active }: { icon: React.ElementType; children: ReactNode; href: string; active: boolean }) {
  return (
    <RouterLink to={href}>
      <Box
        display="flex"
        alignItems="center"
        px={3}
        py={2}
        borderRadius="md"
        fontWeight={active ? "bold" : "normal"}
        bg={active ? "rgba(255, 195, 0, 0.12)" : "transparent"} // Using accent color with transparency
        color={active ? "brand.accent" : "white"}
        borderLeft={active ? "4px solid #FFC300" : "4px solid transparent"}
        _hover={{ bg: "rgba(255,255,255,0.08)", textDecoration: "none" }}
        mb={1}
        w="full" // Make link take full width
        cursor="pointer"
      >
        <Box as={Icon} mr={3} fontSize="xl" />
        {children}
      </Box>
    </RouterLink>
  );
}

