/*
维护状态state
修改状态commit
业务逻辑状态控制dispatch
状态派发getter
实现state响应式
插件
混入
*/
let Vue;
function _install(_Vue, storeName = '$store'){
	Vue = _Vue;
	// 混入： 把store选项指定到Vue原型上
	Vue.mixin({
		beforeCreate() {
			if(this.$options.$store){
				Vue.prototype[storeName] = this.$options.$store;
			}
		}
	})
}
class Store{
	constructor(options = {}){
		// 利用Vue数据响应式
		this.state = new Vue({
			data: options.state,
		});
		this.mutations = this.options.mutations || {};
		this.actions = this.options.actions || {};
		options.getters && this.handleGetters(options.getters);
	}
	// 触发mutations,需先实现commit
	commit = (type, payload)=>{
		const fn = this.mutations[type];
		fn(this.state, payload);
	}
	// 触发actions，需先实现dispatch
	dispatch = (type, payload)=>{
		const fn = this.actions[type];
		return fn({commit: this.commit, state: this.state}, payload);
	}
	handleGetters(getters){
		this.getters = {};
		Object.keys(getters).forEach(key=>{
			Object.defineProperty(this.getters, key, {
				get: ()=>{
					return getters[key](this.state);
				},
			});
		});
	}
}
export default {Store, install}