import React from 'react';

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <li className="flex items-start mb-6">
    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-4 mt-1 flex-shrink-0">
      {number}
    </span>
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    </div>
  </li>
);

const Callout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-2 rounded">
    {children}
  </div>
);

const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
    {children}
  </div>
);

const Docs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-3xl font-bold text-white">Integrating Firebase Service Account Secrets in GitHub</h1>
        </div>
        <div className="px-6 py-8">
          <section className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              This guide walks you through securely adding your Firebase service account key as a GitHub Actions repository secret, enabling automated deployments to Firebase Hosting.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Step-by-Step Guide</h2>
            <ol className="space-y-6">
              <Step number={1} title="Access Repository Settings">
                <p className="text-gray-700 mb-2">Navigate to your GitHub repository settings for secrets.</p>
                <p className="text-gray-600">Go to: <a href="https://github.com/honeygracejilla608-create/VSCodeNode-frontend/settings/secrets/actions" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://github.com/honeygracejilla608-create/VSCodeNode-frontend/settings/secrets/actions</a></p>
              </Step>

              <Step number={2} title="Add a New Repository Secret">
                <p className="text-gray-700 mb-2">Create the secret with your Firebase service account JSON.</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                  <li>Click <strong>"New repository secret"</strong>.</li>
                  <li>In <strong>"Name"</strong>, enter: <code className="bg-gray-100 px-1 rounded">FIREBASE_SERVICE_ACCOUNT</code></li>
                  <li>In <strong>"Secret"</strong>, paste your full Firebase service account key JSON.</li>
                  <li>Click <strong>"Add secret"</strong> to save.</li>
                </ul>
                <Callout>
                  <strong>Example JSON Structure:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-sm mt-2 overflow-x-auto">
{`{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@your-project.iam.gserviceaccount.com",
  ...
}`}
                  </pre>
                  <p className="text-sm mt-2">Get this from Firebase Console > Project Settings > Service Accounts > Generate new private key.</p>
                </Callout>
              </Step>

              <Step number={3} title="Trigger GitHub Actions Deployment">
                <p className="text-gray-700 mb-2">Start a new deployment to test the secret.</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Option 1:</strong> Push a small change to the main branch (e.g., add a comment in any file).</li>
                  <li><strong>Option 2:</strong> Run the 1-click deployment script if available in your repo.</li>
                  <li>Monitor progress in the <strong>Actions</strong> tab of your GitHub repository.</li>
                </ul>
              </Step>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tips and Security Recommendations</h2>
            <InfoBox>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Never share keys publicly:</strong> Keep service account keys secure and avoid committing them to code.</li>
                <li><strong>Restrict permissions:</strong> Limit the service account to only necessary Firebase roles (e.g., Editor for Hosting).</li>
                <li><strong>Rotate keys regularly:</strong> Generate new keys periodically and update secrets to maintain security.</li>
                <li><strong>Use environment variables:</strong> For local development, store keys in <code className="bg-gray-100 px-1 rounded">.env</code> files (add to .gitignore).</li>
              </ul>
            </InfoBox>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Success Confirmation</h2>
            <p className="text-gray-700">
              If successful, you'll see a green checkmark in the GitHub Actions run. Your app will be deployed to Firebase Hosting (e.g., <code className="bg-gray-100 px-1 rounded">https://your-project.web.app</code>). Check the live site for updates!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Docs;
