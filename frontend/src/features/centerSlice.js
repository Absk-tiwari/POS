import { createSlice } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";
import { Warning } from "../helpers/utils";
const withImg = localStorage.getItem('_pos_theme') ==='default' && JSON.parse(localStorage.getItem('img_disp')?? 'true');

export const commonApiSlice = createApi({
	reducerPath:'commonApi',
	baseQuery: fetchBaseQuery({ baseUrl:process.env.REACT_APP_BACKEND_URI ,
		prepareHeaders: ( headers, { getState }) => {   
			headers.set('Accept','application/json' ) 
			headers.set('Content-Type', 'application/json') 
			headers.set("pos-token", localStorage.getItem('pos-token')) 
			headers.set("Authorization", `Bearer ${localStorage.getItem('pos-token')}`) 
			return headers
		}
	}),
	
	endpoints: builder => ({

		getNotifications: builder.query({
			query: ()=> {
				return {
					url: `/config/notifications`,
					method:"GET"
				}
			},
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					await queryFulfilled;
				} catch ({error}) {
					const {status, data} = error
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) {
						dispatch({type:"NOT_CONNECTED"});
					}
				}
			}
		}),
	   
		getOrders: builder.query({
			query: () => ({
			  url: 'orders',
			}),
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled;
					console.log(data)
				} catch ({error}) {
					const {status, data} = error
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) {
						dispatch({type:"NOT_CONNECTED"});
					}
				}
			}
		}),
		
		getProductCategories:builder.query({
			query:()=>{
				return {
					url:`/category`,
					method: 'GET',
				}
			},
			async onQueryStarted( _ , {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled;
					if(data.status) {
						dispatch({
							type:"CATEGORIES",
							payload: data.categories
						})
					}
				} catch ({error}) {
					const {status, data} = error;
					console.log("eror hai", status, data)
					if(status === 400 && data.message.indexOf('getaddrinfo')!== -1) {
						// dispatch ho rha
						// Navigate('/disconnected')
						dispatch({type:"NOT_CONNECTED"})
					}
				}
			}
		}),
		getListCategories:builder.query({
			query:() => {
				return {
					url:`/category?list=true`,
					method:'GET'
				}
			},
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled;
					console.log(data)
				} catch ({error}) {
					const {status, data} = error
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) {
						dispatch({type:"NOT_CONNECTED"});
					}
				}
			}
		}),
		deleteCategory: builder.mutation({
			query: ({id})=> {
				return {
					url: `category/remove/${id}`,
					method: `GET`
				}
			},
			async onQueryStarted(args, {dispatch , queryFulfilled}) {
				try {
					const {data} = await queryFulfilled;
					if(data.status) {
						toast.success(data.message)
					} else {
						toast.error(data.message)
					}
					dispatch(
						commonApiSlice.util.updateQueryData('getPosProducts', undefined, (draft) => {
							const {products} = draft; 
							if(data.status) { 
								if(products) {
									draft['products'] = products.filter( item => parseInt(item.category_id) !== parseInt(args.id) )
								}
							}
						})
					)
				} catch (error) {
					console.log("Exception occurred :- "+error);
				}
			}
		}),
		toggleCategory: builder.mutation({
			query: ({id, status})=> {
				return {
					url: `/category/toggle/${id}/${status}`,
					method: "GET"
				}
			},
			async onQueryStarted(args, { dispatch, queryFulfilled }) {
				try 
				{
					const {data} = await queryFulfilled; // Wait for the mutation to succeed
					if(data.status) {
						toast.success(data.message)
					} else {
						toast.error(data.message);
					} 
					dispatch(
						commonApiSlice.util.updateQueryData('getProductCategories', undefined, (draft) => {
							draft['categories'] = draft.categories.map( cat => cat.id=== parseInt(args.id) ? data.category : cat )
						})
					);
					
						dispatch(
							commonApiSlice.util.updateQueryData('getPosProducts', undefined, draft => { 
								draft['products'] = draft.products.map(item => {
									if(item.category_id===parseInt(data.category.id)) {
										item.pos = data.category.status;
									}
									return item;
								})
							})
						)
					

				} catch (error) {
					console.error('Failed to update cache:', error);
				}
			}
		}),
		getTaxes: builder.query({
			query: () => ({
				url: 'tax/list',
				method: 'GET'
			}),
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					
				} catch ({error}) {
					const {status, data} = error;
					if(status === 400 && data.message.indexOf('getaddrinfo') !== -1) {
						dispatch({type:"NOT_CONNECTED"})
					}
				}
			}
		}),
		toggleTax: builder.mutation({
			query: ({id, status})=> {
				return {
					url: `/tax/toggle/${id}/${status}`,
					method: "GET"
				}
			},
			async onQueryStarted(args, { dispatch, queryFulfilled }) {
				try 
				{
					const {data} = await queryFulfilled; // Wait for the mutation to succeed
					if(data.status) {
						toast.success(data.message)
					} else {
						toast.error(data.message);
					}
					dispatch(
						commonApiSlice.util.updateQueryData('getTaxes', undefined, (draft) => {
							// console.log(JSON.stringify(draft))
							draft['taxes'] = draft.taxes.map( cat => cat.id=== parseInt(args.id) ? data.tax : cat )
							// const {products} = draft;
							// const {updated} = args;
							// const index = products.findIndex((item) => item.id === updated.id);
							// if (index !== -1) draft['products'][index] = updated; // Update the item in the cache
						})
					);

				} catch (error) {
					console.error('Failed to update cache:', error);
				}
			}
		}),
		getProducts:builder.query({
			query:()=> ({
				url:`/products`,
				method: 'GET',
			}),
			async onQueryStarted(args, { dispatch, queryFulfilled }) { 
				try {
					const {data} = await queryFulfilled;
					if(!data.status && data.relaunch) {
						window.electronAPI?.relaunch()
					}
				} catch ({error}) {
					const {status, data} = error
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) { // .indexOf('getaddrinfo') !== -1
						dispatch({type:"NOT_CONNECTED"})
					}
				}	
			}
		}),
		getNotes: builder.query({
			query:()=> ({
				url:`/notes`,
				method: 'GET',
			}),
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled;
					console.log(data)
				} catch ({error}) {
					const {status, data} = error
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) {
						dispatch({type:"NOT_CONNECTED"});
					}
				}
			}
		}),
		getPosProducts: builder.query({
			query:()=> ({
				url:`/pos/products/`+ withImg,
				method:'GET'
			}),
			async onQueryStarted(args, { dispatch, queryFulfilled }) { 
				try {
					const {data} = await queryFulfilled;
					if(!data.status && data.relaunch) {
						window.electronAPI?.relaunch()
					}
				} catch ({error}) {
					const {status, data} = error;
					if(status === 401) {
						dispatch({type:"LOGOUT"})	
					}
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) { // .indexOf('getaddrinfo') !== -1
						dispatch({type:"NOT_CONNECTED"})
					}
				}	
			}
		}),
		updateProduct: builder.mutation({
			query:(fd)=> ({
				url:`/products/update`,
				method:'POST',
				headers:{ 
					"Accept"       :"application/json",
					"Content-Type" : "multipart/form-data",
					"pos-token": localStorage.getItem('pos-token'),
					"Authorization": localStorage._pos_app_key
				},
				body:fd
			}),
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					await queryFulfilled;
				} catch ({error}) {
					const {status, data} = error
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) {
						dispatch({type:"NOT_CONNECTED"});
					}
				}
			}
		}),
		updateStock: builder.mutation({
			query: ({id, updated}) => ({
				url:`/products/updateStock/${id}`,
				method:"POST",
				body: updated
			}),
			async onQueryStarted(args, { dispatch, queryFulfilled }) {
				try 
				{
					const {data} = await queryFulfilled; // Wait for the mutation to succeed
					if(data.status) {
						toast.success(data.message)
					} else {
						toast.error(data.message);
					} 
					console.log(args, data)
					dispatch(
						commonApiSlice.util.updateQueryData('getProducts', undefined, (draft) => {
							const {products} = draft;
							draft['products'] = products.map(item => {
								if(item.id===parseInt(args.id)){
									item.quantity = data.product.quantity
								}
								return item
							})
						})
					);

					dispatch(
						commonApiSlice.util.updateQueryData('getPosProducts', undefined, (draft) => {
							const {products} = draft;
							draft['products'] = products.map(item => {
								if(item.id===parseInt(args.id)){
									item.quantity = data.product.quantity
								}
								return item
							})
						})
					);

				} catch ({error}) {
					console.error('Failed to update cache:', error);
					const {status, data} = error;
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) { // .indexOf('getaddrinfo') !== -1
						dispatch({type:"NOT_CONNECTED"})
					}
				}
			}
		}),
		togglePOS: builder.mutation({ // for updation in pos status
			query: ({id, status}) => ({
				url:`/products/update-product-pos/${id}/${status}`,
				method:"GET"
			}),
			async onQueryStarted(args, {dispatch, queryFulfilled}) {
				try {
					const {data} = await queryFulfilled;
					
					if(data.status) {
						toast.success("POS status updated!")
					} else {
						toast.error("Something went wrong");
					}
					dispatch(
						commonApiSlice.util.updateQueryData('getProducts', undefined, (draft) => {
							const {products} = draft;
							draft['products'] = products.map(item => {
								if(item.id===parseInt(args.id)){
									item.pos = args.status
								}
								return item
							})
						})
					);

					dispatch(
						commonApiSlice.util.updateQueryData('getPosProducts', undefined, draft => {
							const {products} = draft; 
							if(products) {
								if(args.status===0)
								{ 
									draft['products'] = products.filter(item => item.id !== parseInt(args.id))
								} else { 
									draft['products'].push(data.product)
								}
							}
						})
					)

				} catch ({error}) {
					console.log(`Exception occurred:- ${error.message}`);
					const {status, data} = error;
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) { // .indexOf('getaddrinfo') !== -1
						dispatch({type:"NOT_CONNECTED"})
					}
				}
			}
		}),
		deleteProduct: builder.mutation({
			query: ({id}) => ({
				url: `/products/remove/${id}`,
				method: "GET",
			}),
			async onQueryStarted(args, {queryFulfilled, dispatch}) {
				try {
					const{data} = await queryFulfilled;
					if(data.status) {
						if(data.disconnected) {
							Warning("Product not deleted on phone due to internet!")
						}
						if(!data.data.status) {
							toast("Product not removed from mobile, Since the application key is not registered! Sync the products to register!",
								{
									icon: '⚠️',
									style: {
										borderRadius: '10px',
										background: '#333',
										color: '#fff',
									},
									duration: 9999
								}
							);
						}
						toast.success(data.message)
					} else {
						toast.error(data.message)
					}

					dispatch(
						commonApiSlice.util.updateQueryData('getProducts', undefined, (draft) => {
							let {products} = draft
							if( products ) {
								draft['products'] = products?.filter( product => product?.id !== parseInt(args.id) )
							}
						})
					)
					dispatch(
						commonApiSlice.util.updateQueryData('getPosProducts', undefined, draft => {
							let {products} = draft;
							if(products) {
								draft['products'] = products.filter( item => item.id!== parseInt(args.id))
							}
						})
					)
				} catch ({error}) {
					const {status, data} = error;
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) { // .indexOf('getaddrinfo') !== -1
						dispatch({type:"NOT_CONNECTED"})
					}
				}
			}
		}),
		getSettings: builder.query({
			query:()=> ({
				url: `/config/settings`,
				method:'GET'
			}),
			async onQueryStarted(_, {dispatch, queryFulfilled}) {
				try {
					await queryFulfilled;
				} catch ({error}) {
					const {status, data} = error
					if(status===400 && data.message.indexOf('getaddrinfo') !== -1) {
						dispatch({type:"NOT_CONNECTED"});
					}
				}
			}
		})
	})	
})

const initialState = {
    loading:true,
    data:[],
	error:''
}

const centerSlice = createSlice({
    name:'api',
    initialState,
    reducers:{
		updateItem(state, action) {
			const { id, data } = action.payload;
			const item = state.items.find(item => item.id === id);
			if (item) {
			  	Object.assign(item, data); // Update the item with new data
			}
		},
	},
    
})
 
export default centerSlice.reducer

export const { 
	useGetProductCategoriesQuery,
	useGetProductsQuery,
	useGetListCategoriesQuery,
	useGetNotesQuery,
	useGetPosProductsQuery,
	useGetTaxesQuery,
	useUpdateProductMutation,
	useUpdateStockMutation,
	useDeleteProductMutation,
	useTogglePOSMutation,
	useToggleCategoryMutation,
	useToggleTaxMutation,
	useGetNotificationsQuery,
	useGetSettingsQuery,
	useGetOrdersQuery
} = commonApiSlice;

export const { updateItem } = centerSlice.actions;