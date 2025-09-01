import { CreateSubscriberData, ListProductsData, UpdateProductStockData, ListOrdersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateSubscriber(options?: useDataConnectMutationOptions<CreateSubscriberData, FirebaseError, void>): UseDataConnectMutationResult<CreateSubscriberData, undefined>;
export function useCreateSubscriber(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSubscriberData, FirebaseError, void>): UseDataConnectMutationResult<CreateSubscriberData, undefined>;

export function useListProducts(options?: useDataConnectQueryOptions<ListProductsData>): UseDataConnectQueryResult<ListProductsData, undefined>;
export function useListProducts(dc: DataConnect, options?: useDataConnectQueryOptions<ListProductsData>): UseDataConnectQueryResult<ListProductsData, undefined>;

export function useUpdateProductStock(options?: useDataConnectMutationOptions<UpdateProductStockData, FirebaseError, void>): UseDataConnectMutationResult<UpdateProductStockData, undefined>;
export function useUpdateProductStock(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProductStockData, FirebaseError, void>): UseDataConnectMutationResult<UpdateProductStockData, undefined>;

export function useListOrders(options?: useDataConnectQueryOptions<ListOrdersData>): UseDataConnectQueryResult<ListOrdersData, undefined>;
export function useListOrders(dc: DataConnect, options?: useDataConnectQueryOptions<ListOrdersData>): UseDataConnectQueryResult<ListOrdersData, undefined>;
