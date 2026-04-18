// commande.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Badge,
  Fade,
  Grow,
  Zoom,
  useTheme,
  alpha,
  Stack,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  Popover
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  LocalShipping as ShippingIcon,
  Done as DoneIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  MoreVert as MoreIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  Assignment as OrderIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Inventory as ProductIcon,
  QrCode as QrIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

// Configuration API
const API_BASE_URL = 'http://localhost:8001/api';

// Constantes
const PRODUITS = [
  "Ruban 100% coton",
  "Ruban Polyester", 
  "Ruban laine",
  "Ruban Acrylique",
  "Ruban Soie",
  "Ruban Lin"
];

const STATUTS = {
  en_attente: { label: 'En attente', color: 'warning', icon: ScheduleIcon, bg: '#fff3e0', order: 1 },
  confirmée: { label: 'Confirmée', color: 'info', icon: CheckCircleIcon, bg: '#e3f2fd', order: 2 },
  en_production: { label: 'En production', color: 'primary', icon: BuildIcon, bg: '#e8eaf6', order: 3 },
  expédiée: { label: 'Expédiée', color: 'secondary', icon: ShippingIcon, bg: '#f3e5f5', order: 4 },
  livrée: { label: 'Livrée', color: 'success', icon: DoneIcon, bg: '#e8f5e9', order: 5 },
  annulée: { label: 'Annulée', color: 'error', icon: CancelIcon, bg: '#ffebee', order: 6 }
};

// Composant de statistiques
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card sx={{ 
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.9 }}>
                <TrendingIcon sx={{ fontSize: 14, mr: 0.5 }} />
                {trend}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <Icon sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// Composant principal
const CommandeModule = () => {
  const theme = useTheme();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [produitsList, setProduitsList] = useState(PRODUITS);

  // Formulaire état
  const [formData, setFormData] = useState({
    numero_commande: '',
    nom_client: '',
    contact_client: '',
    date_commande: new Date().toISOString().split('T')[0],
    produit: '',
    quantite: '',
    statut: 'en_attente'
  });
  const [formErrors, setFormErrors] = useState({});

  // Charger les commandes
  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/commandes/`);
      setCommandes(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      showSnackbar('Erreur lors du chargement des commandes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les commandes
  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = searchTerm === '' || 
      commande.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.nom_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.contact_client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || commande.statut === statusFilter;
    const matchesProduct = productFilter === '' || commande.produit === productFilter;
    
    const matchesDate = (!dateRange.start || commande.date_commande >= dateRange.start) &&
      (!dateRange.end || commande.date_commande <= dateRange.end);
    
    return matchesSearch && matchesStatus && matchesProduct && matchesDate;
  });

  // Statistiques
  const stats = {
    total: commandes.length,
    en_attente: commandes.filter(c => c.statut === 'en_attente').length,
    en_production: commandes.filter(c => c.statut === 'en_production').length,
    livree: commandes.filter(c => c.statut === 'livrée').length,
    total_quantite: commandes.reduce((sum, c) => sum + c.quantite, 0)
  };

  // Pagination
  const paginatedCommandes = filteredCommandes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Gestion formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.numero_commande) errors.numero_commande = 'N° commande requis';
    if (!formData.nom_client) errors.nom_client = 'Nom client requis';
    if (!formData.contact_client) errors.contact_client = 'Contact requis';
    if (!formData.produit) errors.produit = 'Produit requis';
    if (!formData.quantite || formData.quantite <= 0) errors.quantite = 'Quantité valide requise';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const dataToSend = {
        ...formData,
        quantite: parseFloat(formData.quantite)
      };
      
      if (selectedCommande) {
        await axios.put(`${API_BASE_URL}/commandes/${selectedCommande.id}`, dataToSend);
        showSnackbar('Commande modifiée avec succès', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/commandes/`, dataToSend);
        showSnackbar('Commande créée avec succès', 'success');
      }
      
      handleCloseDialog();
      fetchCommandes();
    } catch (error) {
      showSnackbar(error.response?.data?.detail || 'Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/commandes/${selectedCommande.id}`);
      showSnackbar('Commande supprimée avec succès', 'success');
      handleCloseDelete();
      fetchCommandes();
    } catch (error) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/commandes/${id}/statut`, null, { params: { statut: newStatus } });
      showSnackbar('Statut mis à jour', 'success');
      fetchCommandes();
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleOpenDialog = (commande = null) => {
    if (commande) {
      setSelectedCommande(commande);
      setFormData({
        numero_commande: commande.numero_commande,
        nom_client: commande.nom_client,
        contact_client: commande.contact_client,
        date_commande: commande.date_commande,
        produit: commande.produit,
        quantite: commande.quantite,
        statut: commande.statut
      });
    } else {
      setSelectedCommande(null);
      setFormData({
        numero_commande: '',
        nom_client: '',
        contact_client: '',
        date_commande: new Date().toISOString().split('T')[0],
        produit: '',
        quantite: '',
        statut: 'en_attente'
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCommande(null);
  };

  const handleCloseDelete = () => {
    setDeleteDialog(false);
    setSelectedCommande(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setProductFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentTab(0);
  };

  const exportToCSV = () => {
    const headers = ['N° Commande', 'Client', 'Contact', 'Date', 'Produit', 'Quantité', 'Statut'];
    const data = filteredCommandes.map(c => [
      c.numero_commande,
      c.nom_client,
      c.contact_client,
      c.date_commande,
      c.produit,
      c.quantite,
      STATUTS[c.statut]?.label || c.statut
    ]);
    
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusChip = (statut) => {
    const config = STATUTS[statut];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Chip
        icon={<Icon sx={{ fontSize: 16 }} />}
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bg,
          color: `${config.color}.main`,
          fontWeight: 'medium',
          '& .MuiChip-icon': { color: 'inherit' }
        }}
      />
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f7fa',
      pt: 3,
      pb: 5
    }}>
      <Container maxWidth="xl">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Gestion des Commandes Clients
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Gérez toutes vos commandes clients en un seul endroit
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Exporter CSV">
                <IconButton onClick={exportToCSV} sx={{ mr: 1, bgcolor: 'white' }}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actualiser">
                <IconButton onClick={fetchCommandes} sx={{ mr: 2, bgcolor: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                  boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3
                }}
              >
                Nouvelle Commande
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Cartes statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Commandes" value={stats.total} icon={OrderIcon} color="#1a237e" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="En attente" value={stats.en_attente} icon={ScheduleIcon} color="#ff9800" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="En production" value={stats.en_production} icon={BuildIcon} color="#2196f3" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Livrées" value={stats.livree} icon={DoneIcon} color="#4caf50" />
          </Grid>
        </Grid>

        {/* Barre de recherche et filtres */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher par N° commande, client ou contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1}>
                <Button
                  variant={showFilters ? "contained" : "outlined"}
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  fullWidth
                >
                  Filtres {showFilters && <Badge badgeContent="•" color="error" sx={{ ml: 1 }} />}
                </Button>
              </Box>
            </Grid>
          </Grid>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Statut</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Statut"
                      >
                        <MenuItem value="">Tous</MenuItem>
                        {Object.entries(STATUTS).map(([key, config]) => (
                          <MenuItem key={key} value={key}>{config.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Produit</InputLabel>
                      <Select
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        label="Produit"
                      >
                        <MenuItem value="">Tous</MenuItem>
                        {produitsList.map(p => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date début"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date fin"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button startIcon={<ClearIcon />} onClick={resetFilters} size="small">
                    Réinitialiser
                  </Button>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>

        {/* Onglets */}
        <Tabs
          value={currentTab}
          onChange={(e, v) => setCurrentTab(v)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Toutes (${filteredCommandes.length})`} />
          <Tab label={`En attente (${filteredCommandes.filter(c => c.statut === 'en_attente').length})`} />
          <Tab label={`En production (${filteredCommandes.filter(c => c.statut === 'en_production').length})`} />
          <Tab label={`Livrées (${filteredCommandes.filter(c => c.statut === 'livrée').length})`} />
        </Tabs>

        {/* Tableau des commandes */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a237e' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N° Commande</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Client</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Produit</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Quantité</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>Chargement des commandes...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedCommandes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucune commande trouvée
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2 }}
                    >
                      Créer votre première commande
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCommandes.map((commande, index) => (
                  <motion.tr
                    key={commande.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <QrIcon sx={{ fontSize: 20, color: '#1a237e' }} />
                        <Typography fontWeight="medium">
                          {commande.numero_commande}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{commande.nom_client}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{commande.contact_client}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {format(new Date(commande.date_commande), 'dd MMM yyyy', { locale: fr })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={commande.produit}
                        size="small"
                        variant="outlined"
                        sx={{ maxWidth: 150, '& .MuiChip-label': { truncate: true } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {commande.quantite} unités
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(commande.statut)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(commande)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedCommande(commande);
                            setDeleteDialog(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCommandes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </TableContainer>
      </Container>

      {/* Dialog de création/modification */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          {selectedCommande ? 'Modifier la commande' : 'Nouvelle commande'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="N° Commande"
                name="numero_commande"
                value={formData.numero_commande}
                onChange={handleFormChange}
                error={!!formErrors.numero_commande}
                helperText={formErrors.numero_commande}
                disabled={!!selectedCommande}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du client"
                name="nom_client"
                value={formData.nom_client}
                onChange={handleFormChange}
                error={!!formErrors.nom_client}
                helperText={formErrors.nom_client}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact client"
                name="contact_client"
                value={formData.contact_client}
                onChange={handleFormChange}
                error={!!formErrors.contact_client}
                helperText={formErrors.contact_client}
                placeholder="Téléphone / Email"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date commande"
                name="date_commande"
                type="date"
                value={formData.date_commande}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth required error={!!formErrors.produit}>
                <InputLabel>Produit</InputLabel>
                <Select
                  name="produit"
                  value={formData.produit}
                  onChange={handleFormChange}
                  label="Produit"
                >
                  {produitsList.map(produit => (
                    <MenuItem key={produit} value={produit}>
                      {produit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantité"
                name="quantite"
                type="number"
                value={formData.quantite}
                onChange={handleFormChange}
                error={!!formErrors.quantite}
                helperText={formErrors.quantite}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">unités</InputAdornment>
                }}
              />
            </Grid>
            {selectedCommande && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    name="statut"
                    value={formData.statut}
                    onChange={handleFormChange}
                    label="Statut"
                  >
                    {Object.entries(STATUTS).map(([key, config]) => (
                      <MenuItem key={key} value={key}>{config.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ bgcolor: '#1a237e' }}
          >
            {selectedCommande ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation suppression */}
      <Dialog open={deleteDialog} onClose={handleCloseDelete}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la commande{' '}
            <strong>{selectedCommande?.numero_commande}</strong> ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommandeModule;