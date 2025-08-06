import {
  Box,
  Flex,
  HStack,
  Button,
  useDisclosure,
  useColorModeValue,
  Stack,
  IconButton,
  Container,
  Text,
  Link,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Features',
    href: '#features',
  },
  {
    label: 'Pricing',
    href: '#pricing',
  },
  {
    label: 'Contact',
    href: '#contact',
  },
];

export default function HomeHeader() {
  const { isOpen, onToggle } = useDisclosure();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <Box
      bg={bgColor}
      px={4}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Container maxW="container.xl">
        <Flex
          color={useColorModeValue('gray.600', 'white')}
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 4 }}
          align={'center'}
        >
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
              }
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <Text
              textAlign={useColorModeValue('left', 'center')}
              fontFamily={'heading'}
              color={useColorModeValue('brand.primary', 'white')}
              fontWeight="bold"
              fontSize="xl"
              cursor="pointer"
              onClick={() => navigate('/')}
            >
              DigiSol.AI
            </Text>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
          >
            <Button
              as={'a'}
              fontSize={'sm'}
              fontWeight={400}
              variant={'link'}
              onClick={handleLogin}
              _hover={{
                textDecoration: 'none',
              }}
            >
              Sign In
            </Button>
            <Button
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'brand.primary'}
              onClick={handleSignup}
              _hover={{
                bg: 'brand.primary',
                opacity: 0.9,
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Flex>

        <CollapsibleNav isOpen={isOpen} onLogin={handleLogin} onSignup={handleSignup} />
      </Container>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('brand.primary', 'white');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Link
            p={2}
            href={navItem.href ?? '#'}
            fontSize={'sm'}
            fontWeight={500}
            color={linkColor}
            _hover={{
              textDecoration: 'none',
              color: linkHoverColor,
            }}
            onClick={(e) => {
              if (navItem.href.startsWith('#')) {
                e.preventDefault();
                scrollToSection(navItem.href.substring(1));
              }
            }}
          >
            {navItem.label}
          </Link>
        </Box>
      ))}
    </Stack>
  );
};

interface CollapsibleNavProps {
  isOpen: boolean;
  onLogin: () => void;
  onSignup: () => void;
}

const CollapsibleNav = ({ isOpen, onLogin, onSignup }: CollapsibleNavProps) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      display={{ base: isOpen ? 'block' : 'none', md: 'none' }}
      bg={useColorModeValue('white', 'gray.900')}
      borderTop={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <VStack spacing={0}>
        {NAV_ITEMS.map((navItem) => (
          <Box key={navItem.label} w="full">
            <Link
              p={4}
              href={navItem.href ?? '#'}
              fontSize={'sm'}
              fontWeight={500}
              color={useColorModeValue('gray.600', 'gray.200')}
              _hover={{
                textDecoration: 'none',
                color: useColorModeValue('brand.primary', 'white'),
                bg: useColorModeValue('gray.50', 'gray.700'),
              }}
              display="block"
              onClick={(e) => {
                if (navItem.href.startsWith('#')) {
                  e.preventDefault();
                  scrollToSection(navItem.href.substring(1));
                }
              }}
            >
              {navItem.label}
            </Link>
          </Box>
        ))}
        <Divider />
        <VStack spacing={4} p={4} w="full">
          <Button
            w="full"
            variant="ghost"
            onClick={onLogin}
          >
            Sign In
          </Button>
          <Button
            w="full"
            colorScheme="blue"
            onClick={onSignup}
          >
            Sign Up
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}; 