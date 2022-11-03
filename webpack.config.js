const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  resolve: {
    symlinks: false,
    modules: ['node_modules', '.'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
    	"https": require.resolve("https-browserify")
    }
  },
	plugins: [
	    new NodePolyfillPlugin()
	],
};
