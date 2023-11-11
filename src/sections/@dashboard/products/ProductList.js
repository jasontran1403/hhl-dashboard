import PropTypes from 'prop-types';
// @mui
import { Grid } from '@mui/material';
import ShopProductCard from './ProductCard';

// ----------------------------------------------------------------------

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
};

export default function ProductList({ products, onProductClick }) {
  
  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid key={product.email} item xs={12} sm={6} md={4} >
          <ShopProductCard key={product.email} product={product} onProductClick={onProductClick} />
        </Grid>
      ))}
    </Grid>
  );
}
