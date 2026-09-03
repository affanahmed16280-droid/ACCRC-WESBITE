import { MembershipForm } from '@/components/membership/MembershipForm';
import { Check } from 'lucide-react';

export default function MembershipPage() {
  return (
    <div className="pt-24 min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-start">
          {/* Left Column: Info */}
          <div>
            <span className="font-mono text-xs tracking-widest text-accent mb-4 block uppercase">MEMBERSHIP</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-8">Join the Mission</h1>
            
            <p className="text-lg text-text-secondary mb-8">
              {/* CUSTOMIZE: Add your club's specific membership details here */}
              Ready to build the future? The Adamjee Cantonment College Robotics Club is looking for passionate students to join our ranks.
            </p>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-text-primary">What ACCRC membership gives you:</h3>
              <ul className="space-y-4">
                {[
                  "Access to workshops, tools, and lab resources",
                  "Opportunity to compete in national robotics competitions",
                  "Hands-on experience with electronics, programming, and mechanical design",
                  "A community of like-minded student engineers"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-4 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-text-secondary">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:mt-0">
            <MembershipForm />
          </div>
        </div>
        
      </div>
    </div>
  );
}
