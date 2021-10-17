import 'normalize.css';
import '~/assets/styles/index.scss';

function importAll(requireContext) {
    return requireContext.keys().forEach(requireContext);
}

importAll(require.context('./components', true, /^\.\/.*\.(jsx?)$/));
importAll(require.context('./pages', true, /^\.\/.*\.(jsx?)$/));
