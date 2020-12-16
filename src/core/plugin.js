import VisionWeb from 'index';
import utils from 'utils';
import semver from 'semver';

export default class Plugin {

    constructor(visionWeb = false, options = {}) {
        if (!visionWeb || !visionWeb instanceof VisionWeb)
            throw new Error('Expected instance of VisionWeb');
        this.visionWeb = visionWeb;
        this.pluginNoOverride = ['register'];
        this.disablePlugins = options.disablePlugins;
    }

    register(Plugin, options) {
        let pluginInterface = {
            requires: '0.0.0',
            components: {}
        }
        let result = {
            libs: [],
            plugged: [],
            skipped: []
        }
        if (this.disablePlugins) {
            result.error = 'This instance of VisionWeb has plugins disabled.'
            return result;
        }
        const plugin = new Plugin(this.visionWeb)
        if (utils.isFunction(plugin.pluginInterface)) {
            pluginInterface = plugin.pluginInterface(options)
        }
        if (semver.satisfies(VisionWeb.version, pluginInterface.requires)) {
            if (pluginInterface.fullClass) {
                // plug the entire class at the same level of visionWeb.vs
                let className = plugin.constructor.name
                let classInstanceName = className.substring(0, 1).toLowerCase() + className.substring(1)
                if (className !== classInstanceName) {
                    VisionWeb[className] = Plugin
                    this.visionWeb[classInstanceName] = plugin
                    result.libs.push(className)
                }
            } else {
                // plug methods into a class, like vs
                for (let component in pluginInterface.components) {
                    if (!this.visionWeb.hasOwnProperty(component)) {
                        continue
                    }
                    let methods = pluginInterface.components[component]
                    let pluginNoOverride = this.visionWeb[component].pluginNoOverride || []
                    for (let method in methods) {
                        if (method === 'constructor' || (this.visionWeb[component][method] &&
                            (pluginNoOverride.includes(method) // blacklisted methods
                                || /^_/.test(method)) // private methods
                        )) {
                            result.skipped.push(method)
                            continue
                        }
                        this.visionWeb[component][method] = methods[method].bind(this.visionWeb[component])
                        result.plugged.push(method)
                    }
                }
            }
        } else {
            throw new Error('The plugin is not compatible with this version of VisionWeb')
        }
        return result
    }
}

