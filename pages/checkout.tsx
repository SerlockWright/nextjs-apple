import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import Button from '../components/Button'
import CheckoutProduct from '../components/CheckoutProduct'
import Header from '../components/Header'
import { selectBasketItems, selectBasketTotal } from '../redux/cartSlice'
import Currency from 'react-currency-formatter'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import Stripe from 'stripe'
import { fetchPostJSON } from '../utils/api-helpers'
import getStripe from '../utils/get-stripejs'

function Checkout() {
    const items = useSelector(selectBasketItems);
    const router = useRouter();
    const [groupedItemsInCart, setGroupedItemsInCart] = useState({} as { [key:string]: Product[] });
    const cartTotal = useSelector(selectBasketTotal);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const groupedItems = items.reduce((results, item) => {
            (results[item._id] = results[item._id] || []).push(item);
            return results;
        }, {} as { [key:string]: Product[] })
        setGroupedItemsInCart(groupedItems)
    }, [items]);

    const createCheckoutSession = async () => {
        setLoading(true);
        const checkoutSession: Stripe.Checkout.Session = await fetchPostJSON("/api/checkout_sessions",{
            items: items,
        });

        //Internal server error
        if ((checkoutSession as any).statusCode === 500) {
            console.error((checkoutSession as any).message);
            return;
        }
        //Redirect to Checkout
        const stripe = await getStripe();
        const {error} = await stripe!.redirectToCheckout({
            // Make the id field from the Checkout Session creation API response
            // available to this file, so you can provide it as parameter here
            // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
            sessionId: checkoutSession.id
        });
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `error.message`.
        console.warn(error.message); 
        setLoading(false);
    };


    return (
        <div className='min-h-screen overflow-hidden bg-[#e7ecee]'>
            <Head>
                <title>Cart - Apple</title>
                <link rel='icon' href='/favicon.ico'/>
            </Head>
            <Header/>
            <main className='mx-auto max-w-5xl pb-24'>
                <div className='px-5'>
                    <h1 className='my-4 text-3xl font-semibold lg:text-4xl'>
                        {items.length > 0 ? "Review your cart." : "Your cart is empty"}
                    </h1>
                    <p className='my-4'>Free delivery and free returns.</p>
                    {items.length === 0 && (
                        <Button
                            title='Continue Shopping'
                            onClick={() => router.push("/")}
                        />
                    )} 
                </div>
                {items.length > 0 && (
                    <div className='mx-5 md:mx-8'>
                        {Object.entries(groupedItemsInCart).map(([key, items]) => (
                            <CheckoutProduct key={key} items={items} id={key}/>
                        ))}
                        <div className='my-12 mt-6 ml-auto max-w-3xl'>
                            <div className='divide-y divide-gray-300'>
                                <div className='pb-4'>
                                    <div className='flex justify-between'>
                                        <p>Subtotal</p>
                                        <p>
                                            <Currency quantity={cartTotal} currency="USD" />
                                        </p>
                                    </div>
                                    <div className='flex justify-between'>
                                        <p>Shipping</p>
                                        <p>FREE</p>
                                    </div>
                                    <div className='flex justify-between'>
                                        <div className='flex flex-col gap-x-1 lg:flex-row'>
                                            Estimated tax for: {" "}
                                            <p className='flex cursor-pointer items-end text-blue-500 hover:underline'>
                                                Enter zipcode
                                                <ChevronDownIcon className='h-6 w-6'/>
                                            </p>
                                        </div>
                                        <p>$ -</p>
                                    </div>
                                </div>
                                <div className='flex justify-between pt-4 text-xl font-semibold'>
                                    <h4>Total</h4>
                                    <h4>
                                        <Currency quantity={cartTotal} currency="USD"/>
                                    </h4>
                                </div>
                            </div>
                            <div className='my-14 space-y-4'>
                                <h4 className='text-xl font-semibold'>
                                    How would like to check out?
                                </h4>
                                <div className='flex flex-col gap-4 md:flex-row'>
                                    <div className='order-2 flex flex-1 flex-col items-center rounded-xl bg-gray-200 p-8
                                        py-12 text-center'>
                                        <h4 className='mb-4 flex flex-col text-xl font-semibold'>
                                            <span>Pay Monthly</span>
                                            <span>with Apple Card</span>
                                            <span>
                                                $283.16/mo. at 0% APR
                                            </span>
                                        </h4>
                                        <Button width='w-full' title='Check Out with Apple Card Monthly Installmetns'></Button>
                                        <p className='mt-2 max-w-[300px] text-[13px]'>
                                            $0.00 due today, which includes applicable full-price
                                            items, down payments, shipping, and taxes.
                                        </p>
                                    </div>
                                    <div className='order-1 flex flex-1 flex-col items-center rounded-xl bg-gray-200 p-8
                                        py-12 text-center'>
                                        <h4 className='mb-4 flex flex-col text-xl font-semibold'>
                                            Pay in full
                                            <span>
                                            <Currency quantity={cartTotal} currency="USD"/>
                                            </span>
                                        </h4>
                                        <Button width='w-full' title='Check Out'
                                            loading={loading}
                                            onClick={createCheckoutSession}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}   
            </main>                                                          
        </div>
    )
}

export default Checkout;