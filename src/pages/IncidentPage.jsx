import React,{useState} from 'react';
import {motion} from 'framer-motion';
import {useForm} from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import {useData} from '../contexts/DataContext';
import {useAuth} from '../contexts/AuthContext';

const {FiAlertTriangle,FiUser,FiCalendar,FiCheck,FiX,FiUsers}=FiIcons;

const IncidentPage=()=> {
  const {findPersonByHandle,addPerson,addPersonEntry,CRIME_TYPES}=useData();
  const {user,getDisplayName}=useAuth();
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [foundPerson,setFoundPerson]=useState(null);

  const {register,handleSubmit,reset,watch,formState: {errors}}=useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0]
    }
  });

  const watchedHandle=watch('handle');

  const onSubmit=async (data)=> {
    setLoading(true);
    setResult(null);
    setFoundPerson(null);

    try {
      // Simulate some processing time
      await new Promise(resolve=> setTimeout(resolve,500));

      let person=findPersonByHandle(data.handle);
      let isNewPerson=false;

      // 🔥 FIXED: If person doesn't exist,create them IN DATABASE
      if (!person) {
        console.log('🔥 Creating new person in database...');
        person=await addPerson({
          name: data.handle,
          handle: data.handle,
          aliases: [],
          location: '',
          language: '',
          avatarUrl: '',
          pledgeRank: '',
          citizenRecordNumber: '',
          note: 'Auto-created from incident report',
          bio: '',
          enlistDate: '',
          lastScanned: new Date().toISOString()
        });
        isNewPerson=true;
        console.log('✅ New person created:',person);
      }

      // Collect selected crime types
      const selectedCrimeTypes=Object.keys(data)
        .filter(key=> key.startsWith('crimeType_') && data[key])
        .map(key=> key.replace('crimeType_',''));

      // 🔥 ENHANCED: Add the incident entry TO DATABASE with witnesses
      console.log('🔥 Creating incident entry in database...');
      const entryData={
        personId: person.id,
        personName: person.name,
        date: data.date,
        description: data.description || `Incident reported involving ${selectedCrimeTypes.length > 0 ? selectedCrimeTypes.map(ct=> CRIME_TYPES.find(c=> c.id===ct)?.name || ct).join(',') : 'unspecified activities'}`,
        crimeTypes: selectedCrimeTypes,
        witnessNames: data.witnessNames || null // 🔥 NEW: Witness names
      };

      const createdEntry=await addPersonEntry(entryData);
      console.log('✅ Incident entry created:',createdEntry);

      setFoundPerson(person);
      setResult({
        success: true,
        message: isNewPerson 
          ? `New person created and incident recorded for ${person.handle}` 
          : `Incident recorded for existing person ${person.handle}`,
        isNewPerson,
        witnessCount: data.witnessNames ? data.witnessNames.split(',').filter(n=> n.trim()).length : 0
      });

      // Reset form after successful submission
      reset({
        handle: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        witnessNames: '' // 🔥 NEW
      });

    } catch (error) {
      console.error('❌ Error creating incident:',error);
      setResult({
        success: false,
        message: 'An error occurred while processing the incident: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Report Incident">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-midnight-300 mb-2">
            Report Incident
          </h3>
          <p className="text-midnight-400">
            Report incidents by entering a person's handle, date, and crime types. If the person doesn't exist, they will be created automatically.
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-midnight-300 mb-2">
                Person Handle *
              </label>
              <div className="relative">
                <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-400" />
                <input
                  {...register('handle', {required: 'Handle is required'})}
                  className="w-full pl-10 pr-4 py-3 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter person handle (e.g., username)"
                />
              </div>
              {errors.handle && (
                <p className="mt-1 text-sm text-red-400">{errors.handle.message}</p>
              )}
              {watchedHandle && (
                <p className="mt-1 text-sm text-midnight-400">
                  {findPersonByHandle(watchedHandle) 
                    ? `✓ Person found: ${findPersonByHandle(watchedHandle).name}`
                    : `⚠ Person not found - will be created automatically`
                  }
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight-300 mb-2">
                Incident Date *
              </label>
              <div className="relative">
                <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-400" />
                <input
                  {...register('date', {required: 'Date is required'})}
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight-300 mb-2">
                Crime Types (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CRIME_TYPES.map((crimeType) => (
                  <label key={crimeType.id} className="flex items-center space-x-2">
                    <input
                      {...register(`crimeType_${crimeType.id}`)}
                      type="checkbox"
                      className="rounded bg-midnight-800 border-midnight-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-midnight-300">{crimeType.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 🔥 NEW: Witnesses Field */}
            <div>
              <label className="block text-sm font-medium text-midnight-300 mb-2">
                <SafeIcon icon={FiUsers} className="inline w-4 h-4 mr-1" />
                Witnesses (Optional)
              </label>
              <input
                {...register('witnessNames')}
                className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter witness names separated by commas (e.g., John Doe, Jane Smith)"
              />
              <p className="mt-1 text-xs text-midnight-400">
                Enter real names of witnesses. New citizen accounts will be created if they don't exist.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter incident description (will be auto-generated if left empty)"
              />
            </div>

            <motion.button
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {loading ? 'Processing Incident...' : 'Report Incident'}
            </motion.button>
          </form>
        </motion.div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            className={`rounded-xl p-4 border ${
              result.success 
                ? 'bg-green-900/30 border-green-500 text-green-200' 
                : 'bg-red-900/30 border-red-500 text-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SafeIcon icon={result.success ? FiCheck : FiX} className="w-5 h-5" />
              <p className="font-medium">{result.message}</p>
            </div>
            {foundPerson && result.success && (
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <div className="flex items-center space-x-3">
                  {foundPerson.avatar_url ? (
                    <img
                      src={foundPerson.avatar_url}
                      alt={foundPerson.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="bg-red-600 rounded-lg p-2">
                      <SafeIcon icon={FiUser} className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{foundPerson.name}</p>
                    <p className="text-green-300 text-sm">@{foundPerson.handle}</p>
                    {result.isNewPerson && (
                      <p className="text-green-400 text-xs">● New person created</p>
                    )}
                    {result.witnessCount > 0 && (
                      <p className="text-blue-400 text-xs">
                        👥 {result.witnessCount} witness{result.witnessCount !== 1 ? 'es' : ''} added
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <div className="bg-midnight-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">How to Use</h4>
          <ul className="space-y-2 text-midnight-300 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">1.</span>
              <span>Enter the person's handle (username) - this is the only required field besides the date</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">2.</span>
              <span>Select the incident date when the activity occurred</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">3.</span>
              <span>Optionally select crime types that apply to this incident</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">4.</span>
              <span>Add witness names separated by commas if there were any witnesses</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">5.</span>
              <span>Add a description if you have specific details (otherwise one will be generated)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">6.</span>
              <span>If the person doesn't exist, they will be created automatically with basic information</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400">7.</span>
              <span>Witnesses will be notified and can provide their statements</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default IncidentPage;