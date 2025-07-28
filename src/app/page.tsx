
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Star, Shield, Truck } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-primary to-secondary rounded-2xl text-primary-content">
        <div className="hero-content text-center py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold font-headline mb-6">
              Let's Ride Together
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Your one-stop shop for premium cycles, gear, and accessories.
              Discover the perfect ride for your next adventure.
            </p>
            <Link href="/products" className="btn btn-accent btn-lg gap-2">
              Explore Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Star className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="card-title justify-center text-xl">Premium Quality</h3>
            <p className="text-base-content/70">
              Only the finest bikes and accessories from trusted brands
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-secondary/10 rounded-full">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <h3 className="card-title justify-center text-xl">Warranty Guaranteed</h3>
            <p className="text-base-content/70">
              Comprehensive warranty on all products for your peace of mind
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Truck className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h3 className="card-title justify-center text-xl">Fast Delivery</h3>
            <p className="text-base-content/70">
              Quick and reliable delivery straight to your doorstep
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="card bg-base-200">
        <div className="card-body text-center py-12">
          <h2 className="card-title justify-center text-3xl font-headline mb-4">
            Ready to Start Your Cycling Journey?
          </h2>
          <p className="text-lg text-base-content/70 mb-6">
            Browse our collection of premium bikes and accessories
          </p>
          <div className="card-actions justify-center">
            <Link href="/products" className="btn btn-primary btn-lg">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
