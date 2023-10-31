// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
  },
  {
    title: 'exness',
    path: '/exness',
    icon: icon('ic_account'),
  },
  {
    title: 'network',
    path: '/network',
    icon: icon('ic_network'),
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: icon('ic_user'),
  },
  {
    title: '2FA',
    path: '/2fa',
    icon: icon('ic_lock'),
  },
  {
    title: 'transaction',
    path: '/transaction',
    icon: icon('ic_transaction'),
  },
  {
    title: 'upload',
    path: '/upload',
    icon: icon('ic_transaction'),
  },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
