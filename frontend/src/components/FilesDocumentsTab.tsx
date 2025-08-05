import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Badge,
  Avatar,
  List,
  ListItem,
  ListIcon,
  Icon,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  Progress,
  Grid,
  GridItem,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Select,
  useColorModeValue,
  Alert,
  AlertIcon,
  Tooltip,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useDisclosure,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  FiUpload, FiDownload, FiTrash2, FiMoreVertical, FiFolder,
  FiFile, FiFileText, FiImage, FiVideo, FiMusic, FiArchive,
  FiEdit, FiShare, FiSearch, FiGrid, FiList, FiFolderPlus, FiZap, FiChevronRight
} from 'react-icons/fi';
import api from '../services/api';

interface ProjectFile {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
  folder: string;
  version: number;
  tags: string[];
  promana_auto_categorized: boolean;
  is_public: boolean;
}

interface Project {
  id: string;
  name: string;
  project_code: string;
}

interface FilesDocumentsTabProps {
  project: Project;
}

const FilesDocumentsTab: React.FC<FilesDocumentsTabProps> = ({ project }) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterFolder, setFilterFolder] = useState('all');
  const [currentFolder, setCurrentFolder] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCreateFolderOpen, onOpen: onCreateFolderOpen, onClose: onCreateFolderClose } = useDisclosure();
  const { isOpen: isFileDetailsOpen, onOpen: onFileDetailsOpen, onClose: onFileDetailsClose } = useDisclosure();
  
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchFiles();
  }, [project.id]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/project-management/files/?project=${project.id}`);
      const filesData = response.data.results || response.data;
      setFiles(filesData);
      
      // Extract unique folders
      const uniqueFolders = [...new Set(filesData.map((file: ProjectFile) => file.folder).filter(Boolean))];
      setFolders(uniqueFolders);
    } catch (err) {
      console.error('Error fetching files:', err);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (uploadFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', project.id);
        formData.append('folder', currentFolder);
        formData.append('name', file.name);

        await api.post('/project-management/files/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(progress);
          },
        });

        setUploadProgress(((i + 1) / uploadFiles.length) * 100);
      }

      toast({
        title: 'Success',
        description: 'Files uploaded successfully',
        status: 'success',
        duration: 3000,
      });

      onClose();
      setUploadFiles([]);
      setUploadProgress(0);
      fetchFiles();
    } catch (err) {
      console.error('Error uploading files:', err);
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      // Create a placeholder file to establish the folder
      const formData = new FormData();
      formData.append('project', project.id);
      formData.append('folder', newFolderName);
      formData.append('name', '.folder');

      await api.post('/project-management/files/', formData);

      toast({
        title: 'Success',
        description: 'Folder created successfully',
        status: 'success',
        duration: 3000,
      });

      onCreateFolderClose();
      setNewFolderName('');
      fetchFiles();
    } catch (err) {
      console.error('Error creating folder:', err);
      toast({
        title: 'Error',
        description: 'Failed to create folder',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await api.delete(`/project-management/files/${fileId}/`);
      
      toast({
        title: 'Success',
        description: 'File deleted successfully',
        status: 'success',
        duration: 3000,
      });

      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'document': return FiFileText;
      case 'image': return FiImage;
      case 'video': return FiVideo;
      case 'audio': return FiMusic;
      case 'archive': return FiArchive;
      default: return FiFile;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'document': return 'blue';
      case 'image': return 'green';
      case 'video': return 'purple';
      case 'audio': return 'orange';
      case 'archive': return 'red';
      default: return 'gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.file_type === filterType;
    const matchesFolder = filterFolder === 'all' || file.folder === filterFolder;
    return matchesSearch && matchesType && matchesFolder;
  });

  const renderFileCard = (file: ProjectFile) => (
    <Card
      key={file.id}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => {
        setSelectedFile(file);
        onFileDetailsOpen();
      }}
    >
      <CardBody p={4}>
        <VStack align="stretch" spacing={3}>
          <Flex justify="space-between" align="start">
            <Icon
              as={getFileIcon(file.file_type)}
              color={`${getFileTypeColor(file.file_type)}.500`}
              boxSize={8}
            />
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList>
                <MenuItem icon={<FiDownload />}>Download</MenuItem>
                <MenuItem icon={<FiShare />}>Share</MenuItem>
                <MenuItem icon={<FiEdit />}>Rename</MenuItem>
                <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleFileDelete(file.id)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          <Box>
            <Text fontSize="sm" fontWeight="medium" color={textColor} noOfLines={2}>
              {file.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatFileSize(file.file_size)}
            </Text>
          </Box>

          <HStack justify="space-between" fontSize="xs" color="gray.500">
            <Text>{formatDate(file.uploaded_at)}</Text>
            <Text>{file.uploaded_by}</Text>
          </HStack>

          {file.tags && file.tags.length > 0 && (
            <HStack spacing={1}>
              {file.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} size="sm" variant="subtle">
                  {tag}
                </Badge>
              ))}
              {file.tags.length > 2 && (
                <Badge size="sm" variant="subtle">
                  +{file.tags.length - 2}
                </Badge>
              )}
            </HStack>
          )}

          {file.promana_auto_categorized && (
            <HStack spacing={1}>
              <Icon as={FiZap} color="brand.500" size="xs" />
              <Text fontSize="xs" color="brand.500">
                AI Categorized
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const renderFileList = (file: ProjectFile) => (
    <Card
      key={file.id}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      _hover={{ shadow: 'sm' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => {
        setSelectedFile(file);
        onFileDetailsOpen();
      }}
    >
      <CardBody py={3}>
        <Grid templateColumns="1fr auto auto auto auto auto" gap={4} alignItems="center">
          <HStack spacing={3}>
            <Icon
              as={getFileIcon(file.file_type)}
              color={`${getFileTypeColor(file.file_type)}.500`}
              boxSize={5}
            />
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                {file.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {file.folder && `${file.folder} • `}{formatFileSize(file.file_size)}
              </Text>
            </Box>
          </HStack>

          <Badge colorScheme={getFileTypeColor(file.file_type)} variant="subtle" size="sm">
            {file.file_type.toUpperCase()}
          </Badge>

          <Text fontSize="sm" color="gray.600">
            {formatDate(file.uploaded_at)}
          </Text>

          <Text fontSize="sm" color="gray.600">
            {file.uploaded_by}
          </Text>

          <Text fontSize="sm" color="gray.600">
            v{file.version}
          </Text>

          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem icon={<FiDownload />}>Download</MenuItem>
              <MenuItem icon={<FiShare />}>Share</MenuItem>
              <MenuItem icon={<FiEdit />}>Rename</MenuItem>
              <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleFileDelete(file.id)}>
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Grid>
      </CardBody>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="md" color={textColor} mb={2}>
            Files & Documents
          </Heading>
          <Text color="gray.600">
            Manage project files, documents, and assets
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiFolderPlus />}
            variant="outline"
            size="sm"
            onClick={onCreateFolderOpen}
          >
            New Folder
          </Button>
          <Button
            leftIcon={<FiUpload />}
            colorScheme="brand"
            size="sm"
            onClick={onOpen}
          >
            Upload Files
          </Button>
        </HStack>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Total Files</StatLabel>
              <StatNumber color={textColor}>{files.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Total Size</StatLabel>
              <StatNumber color={textColor}>
                {formatFileSize(files.reduce((acc, file) => acc + file.file_size, 0))}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Folders</StatLabel>
              <StatNumber color={textColor}>{folders.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">AI Categorized</StatLabel>
              <StatNumber color="brand.500">
                {files.filter(f => f.promana_auto_categorized).length}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters and Search */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
            <HStack flex="1" maxW="400px">
              <Icon as={FiSearch} color="gray.400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="filled"
              />
            </HStack>
            
            <HStack>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                variant="filled"
                minW="120px"
              >
                <option value="all">All Types</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="archive">Archives</option>
              </Select>
              
              <Select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                variant="filled"
                minW="120px"
              >
                <option value="all">All Folders</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </Select>
              
              <IconButton
                icon={view === 'grid' ? <FiList /> : <FiGrid />}
                onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                variant="outline"
                aria-label="Toggle view"
              />
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {/* Breadcrumb */}
      {currentFolder && (
        <HStack mb={4} spacing={2}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolder('')}
          >
            Root
          </Button>
          <Icon as={FiChevronRight} color="gray.400" />
          <Text fontSize="sm" color="gray.600">{currentFolder}</Text>
        </HStack>
      )}

      {/* Files Grid/List */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
          <Spinner size="lg" color="brand.500" />
        </Box>
      ) : filteredFiles.length === 0 ? (
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody textAlign="center" py={12}>
            <Icon as={FiFolder} size="48px" color="gray.400" mb={4} />
            <Text fontSize="lg" color="gray.600" mb={2}>
              No files found
            </Text>
            <Text color="gray.500" mb={4}>
              {searchQuery || filterType !== 'all' || filterFolder !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by uploading your first file'
              }
            </Text>
            {!searchQuery && filterType === 'all' && filterFolder === 'all' && (
              <Button colorScheme="brand" onClick={onOpen}>
                Upload Files
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={3} align="stretch">
          {view === 'grid' ? (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }} gap={4}>
              {filteredFiles.map(renderFileCard)}
            </Grid>
          ) : (
            filteredFiles.map(renderFileList)
          )}
        </VStack>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Files</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Select Files</FormLabel>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                  accept="*/*"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Folder (Optional)</FormLabel>
                <Select
                  value={currentFolder}
                  onChange={(e) => setCurrentFolder(e.target.value)}
                  placeholder="Select folder"
                >
                  {folders.map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </Select>
              </FormControl>
              
              {uploadFiles.length > 0 && (
                <Box w="full">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Selected Files ({uploadFiles.length}):
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {uploadFiles.map((file, index) => (
                      <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm">{file.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatFileSize(file.size)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
              
              {uploading && (
                <Box w="full">
                  <Text fontSize="sm" mb={2}>Uploading...</Text>
                  <Progress value={uploadProgress} colorScheme="brand" />
                </Box>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleFileUpload}
              isLoading={uploading}
              loadingText="Uploading..."
              isDisabled={uploadFiles.length === 0}
            >
              Upload Files
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Folder Modal */}
      <Modal isOpen={isCreateFolderOpen} onClose={onCreateFolderClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Folder Name</FormLabel>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateFolderClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleCreateFolder}
              isDisabled={!newFolderName.trim()}
            >
              Create Folder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* File Details Modal */}
      <Modal isOpen={isFileDetailsOpen} onClose={onFileDetailsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedFile && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <Icon
                    as={getFileIcon(selectedFile.file_type)}
                    color={`${getFileTypeColor(selectedFile.file_type)}.500`}
                    boxSize={12}
                  />
                  <Box flex="1">
                    <Text fontSize="lg" fontWeight="medium" color={textColor}>
                      {selectedFile.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {formatFileSize(selectedFile.file_size)} • {selectedFile.file_type.toUpperCase()}
                    </Text>
                  </Box>
                </HStack>
                
                <Divider />
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Uploaded by</Text>
                    <Text fontSize="sm" fontWeight="medium">{selectedFile.uploaded_by}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Upload date</Text>
                    <Text fontSize="sm" fontWeight="medium">{formatDate(selectedFile.uploaded_at)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Version</Text>
                    <Text fontSize="sm" fontWeight="medium">v{selectedFile.version}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Folder</Text>
                    <Text fontSize="sm" fontWeight="medium">{selectedFile.folder || 'Root'}</Text>
                  </Box>
                </SimpleGrid>
                
                {selectedFile.tags && selectedFile.tags.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>Tags</Text>
                    <HStack spacing={2}>
                      {selectedFile.tags.map((tag, index) => (
                        <Badge key={index} colorScheme="brand" variant="subtle">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
                
                {selectedFile.promana_auto_categorized && (
                  <Alert status="info">
                    <AlertIcon />
                    <Text fontSize="sm">
                      This file was automatically categorized by Promana AI
                    </Text>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFileDetailsClose}>
              Close
            </Button>
            <Button colorScheme="brand">
              Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FilesDocumentsTab; 