
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | MYCOgenesis',
    description: 'Get in touch with the MYCOgenesis team. We are here to answer your questions about our products, research, and mission.',
};

export default function ContactPage() {
    return (
        <div className="bg-slate-50">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">Contact Us</h1>
                    <p className="mt-4 text-xl text-gray-600">We&apos;d love to hear from you. Let&apos;s connect.</p>
                </div>

                <div className="mt-16 grid md:grid-cols-2 gap-16">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-800">Our Headquarters</h3>
                            <p className="mt-2 text-lg text-gray-600">
                                123 Mycelium Way<br />
                                Sporeville, Earth 12345
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-800">Email Us</h3>
                            <p className="mt-2 text-lg text-gray-600">
                                <a href="mailto:info@mycogenesis.com" className="text-teal-600 hover:text-teal-700">info@mycogenesis.com</a>
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-800">Call Us</h3>
                            <p className="mt-2 text-lg text-gray-600">(123) 456-7890</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-800">Send a Message</h3>
                        <form action="#" method="POST" className="mt-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="sr-only">Full Name</label>
                                <input type="text" name="name" id="name" autoComplete="name" required
                                       className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500 border-gray-300 rounded-md"
                                       placeholder="Full Name" />
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input id="email" name="email" type="email" autoComplete="email" required
                                       className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500 border-gray-300 rounded-md"
                                       placeholder="Email Address" />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">Message</label>
                                <textarea id="message" name="message" rows={4} required
                                          className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500 border border-gray-300 rounded-md"
                                          placeholder="Your Message"></textarea>
                            </div>
                            <div>
                                <button type="submit"
                                        className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
