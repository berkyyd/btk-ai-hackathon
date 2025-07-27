import { useState } from 'react'
import Card from '../components/Card.tsx'

function SinavSimulasyonu() {
  const [step, setStep] = useState(1)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedExamType, setSelectedExamType] = useState<string>('')
  const [selectedExamFormat, setSelectedExamFormat] = useState<string>('')

  // Statik veriler kaldırıldı - Backend entegrasyonu gerekiyor
  // const courses: any[] = []
  // const examTypes: string[] = []
  // const examFormats: string[] = []

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1)
  }

  const handlePrev = () => {
    setStep((prevStep) => prevStep - 1)
  }

  const handleSubmit = () => {
    alert(
      `Sınav Oluşturuldu:\nDers: ${selectedCourse}\nTür: ${selectedExamType}\nFormat: ${selectedExamFormat}`
    )
    // Backend entegrasyonu burada yapılacak
  }

  return (
    <div className='py-8'>
      <h1 className='text-4xl font-bold text-text mb-8 text-center'>
        Sınav Simülasyonu
      </h1>

      {/* Progress Bar */}
      <div className='flex justify-between items-center mb-8 bg-card rounded-lg shadow-md p-2'>
        <div
          className={`flex-1 text-center py-2 rounded-md ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-100 text-text-light'}`}
        >
          1. Ders Seçimi
        </div>
        <div
          className={`flex-1 text-center py-2 rounded-md mx-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-100 text-text-light'}`}
        >
          2. Sınav Türü
        </div>
        <div
          className={`flex-1 text-center py-2 rounded-md ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-100 text-text-light'}`}
        >
          3. Sınav Formatı
        </div>
      </div>

      {/* Step 1: Ders Seçimi */}
      {step === 1 && (
        <Card className='p-8 mb-8'>
          <h2 className='text-2xl font-semibold text-text mb-4'>
            1. Ders Seçimi
          </h2>
          <label
            htmlFor='course-select'
            className='block text-text text-sm font-bold mb-2'
          >
            Ders Seçin:
          </label>
          <select
            id='course-select'
            className='w-full py-2 px-3 bg-background border border-gray-300 rounded-md text-text
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value=''>Ders Seçiniz</option>
            {/* Backend entegrasyonu sonrası ders listesi yüklenecek */}
          </select>
          <div className='flex justify-end mt-6'>
            <button
              onClick={handleNext}
              disabled={!selectedCourse}
              className='bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-300'
            >
              İleri
            </button>
          </div>
        </Card>
      )}

      {/* Step 2: Sınav Türü Seçimi */}
      {step === 2 && (
        <Card className='p-8 mb-8'>
          <h2 className='text-2xl font-semibold text-text mb-4'>
            2. Sınav Türü Seçimi
          </h2>
          <label
            htmlFor='exam-type-select'
            className='block text-text text-sm font-bold mb-2'
          >
            Sınav Türü Seçin:
          </label>
          <select
            id='exam-type-select'
            className='w-full py-2 px-3 bg-background border border-gray-300 rounded-md text-text
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
          >
            <option value=''>Sınav Türü Seçiniz</option>
            {/* Backend entegrasyonu sonrası sınav türleri yüklenecek */}
          </select>
          <div className='flex justify-between mt-6'>
            <button
              onClick={handlePrev}
              className='bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-secondary transition-colors duration-300'
            >
              Geri
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedExamType}
              className='bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-300'
            >
              İleri
            </button>
          </div>
        </Card>
      )}

      {/* Step 3: Sınav Formatı Seçimi */}
      {step === 3 && (
        <Card className='p-8 mb-8'>
          <h2 className='text-2xl font-semibold text-text mb-4'>
            3. Sınav Formatı Seçimi
          </h2>
          <label
            htmlFor='exam-format-select'
            className='block text-text text-sm font-bold mb-2'
          >
            Sınav Formatı Seçin:
          </label>
          <select
            id='exam-format-select'
            className='w-full py-2 px-3 bg-background border border-gray-300 rounded-md text-text
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            value={selectedExamFormat}
            onChange={(e) => setSelectedExamFormat(e.target.value)}
          >
            <option value=''>Sınav Formatı Seçiniz</option>
            {/* Backend entegrasyonu sonrası sınav formatları yüklenecek */}
          </select>
          <div className='flex justify-between mt-6'>
            <button
              onClick={handlePrev}
              className='bg-secondary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-secondary transition-colors duration-300'
            >
              Geri
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedExamFormat}
              className='bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-300'
            >
              Sınavı Başlat
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default SinavSimulasyonu
