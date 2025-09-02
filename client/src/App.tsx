import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { CreateEbookRequestInput, EbookRequestResponse } from '../../server/src/schema';

function App() {
  const [formData, setFormData] = useState<CreateEbookRequestInput>({
    name: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<EbookRequestResponse | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowAlert(false);

    try {
      const result = await trpc.createEbookRequest.mutate(formData);
      setResponse(result);
      setShowAlert(true);
      
      if (result.success) {
        // Reset form on success
        setFormData({ name: '', email: '' });
      }
    } catch (error) {
      console.error('Failed to submit ebook request:', error);
      setResponse({
        success: false,
        message: 'Sorry, something went wrong. Please try again later.'
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <img 
                src="https://media.designrush.com/agencies/293148/conversions/Hi-Interactive-logo-profile.jpg"
                alt="HI Interactive"
                className="h-8 w-auto filter invert"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-slate-50 -z-10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-red-100/20 to-transparent rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Column - Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-red-700 text-sm font-medium">Free Ebook Collection</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                    Design Systems for{' '}
                    <span className="text-red-600">Business Growth</span>{' '}
                    and Technical Excellence
                  </h1>
                  
                  <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                    Get 2 free ebooks for C-Level executives, Product and UX/Tech leaders. 
                    Learn how design systems speed digital transformation, cut costs, and 
                    scale UX with consistency.
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { icon: '🚀', title: 'Speed Transformation', desc: 'Accelerate digital initiatives' },
                    { icon: '💰', title: 'Reduce Costs', desc: 'Cut development overhead' },
                    { icon: '📏', title: 'Scale Consistency', desc: 'Maintain brand uniformity' },
                    { icon: '👥', title: 'Executive Insights', desc: 'Strategic leadership guidance' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{benefit.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{benefit.title}</h3>
                        <p className="text-slate-600 text-sm">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>


              </div>

              {/* Right Column - Form */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-md">
                  <Card className="border-0 shadow-xl shadow-red-100/50 bg-white">
                    <CardContent className="p-8">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-red-200/50">
                          <span className="text-2xl">📚</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                          Get Your Free Ebooks
                        </h2>
                        <p className="text-slate-600 text-sm">
                          Instant download • No spam • Trusted by 10,000+ leaders
                        </p>
                      </div>

                      {showAlert && response && (
                        <Alert className={`mb-6 border-0 ${
                          response.success 
                            ? 'bg-green-50 text-green-800' 
                            : 'bg-red-50 text-red-800'
                        }`}>
                          <AlertDescription>
                            {response.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <Input
                              type="text"
                              placeholder="Your full name"
                              value={formData.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev: CreateEbookRequestInput) => ({ ...prev, name: e.target.value }))
                              }
                              required
                              className="h-12 text-base border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div>
                            <Input
                              type="email"
                              placeholder="Your work email"
                              value={formData.email}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev: CreateEbookRequestInput) => ({ ...prev, email: e.target.value }))
                              }
                              required
                              className="h-12 text-base border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-base shadow-lg shadow-red-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-red-200/60 border-0"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                              <span>Sending...</span>
                            </div>
                          ) : (
                            <>
                              Download Free Ebooks
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-slate-500 text-center leading-relaxed">
                          By downloading, you agree to receive occasional emails about design systems. 
                          Unsubscribe anytime. <a href="#" className="text-red-600 hover:text-red-700">Privacy Policy</a>
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="bg-slate-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  What You'll Discover
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Practical insights from industry leaders who've successfully implemented design systems at scale
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Executive Playbook</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Strategic frameworks for C-Level executives to champion design systems, 
                    measure ROI, and drive organizational alignment across teams.
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-500">
                      <span>✓ Strategy frameworks</span>
                      <span className="mx-3">•</span>
                      <span>✓ ROI measurement</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Technical Implementation</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Detailed technical guide for Product and UX/Tech leaders on building, 
                    scaling, and maintaining design systems that grow with your business.
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-500">
                      <span>✓ Implementation guide</span>
                      <span className="mx-3">•</span>
                      <span>✓ Scaling strategies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <img 
                src="https://file-manager.hi-interactive.com/website-2023/hiinteractivelogodark.svg"
                alt="HI Interactive"
                className="h-8 w-auto filter invert"
              />
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Empowering digital transformation through design systems and strategic UX consulting.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-red-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-red-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-red-400 transition-colors">Contact</a>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800">
              <p className="text-slate-500 text-xs">
                © 2024 HI Interactive. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;