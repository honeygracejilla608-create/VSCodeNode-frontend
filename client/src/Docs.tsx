import React from 'react';

const Docs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-3xl font-bold text-white">1-Click Deployment with deploy.bat</h1>
        </div>
        <div className="px-6 py-8">
          <section className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              Streamline your development workflow with effortless deployment. The <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">deploy.bat</code> script enables instant, automated deployment to production with just one click—no manual commands required.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Use</h2>
            <p className="text-gray-600 mb-4">Follow these simple steps to deploy your project:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Navigate to your project folder where <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">deploy.bat</code> is located.</li>
              <li>Double-click <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">deploy.bat</code> or run it from the command line.</li>
              <li>The script automatically performs the following steps:</li>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-1">
                <li>Adds all changes (<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">git add .</code>)</li>
                <li>Commits with an auto-generated timestamp message</li>
                <li>Pushes changes to GitHub (<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">git push origin main</code>)</li>
                <li>Triggers GitHub Actions deployment</li>
              </ul>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Output Example</h2>
            <p className="text-gray-600 mb-4">Here's what you'll see after running the script:</p>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-800">
{`🚀 Starting 1-Click Deployment...
✅ Deployment triggered! Check GitHub Actions.`}
            </pre>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notes</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>If there are no changes to commit, the script will fail on the commit step as expected—make sure you have uncommitted changes.</li>
              <li>This is truly a 1-click deployment: no typing commands, just click and deploy with automatic feedback.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Test Guide</h2>
            <p className="text-gray-600 mb-4">Test the deployment script with these steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Make a small change, such as editing a comment in any file.</li>
              <li>Double-click <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">deploy.bat</code>.</li>
              <li>Watch as it instantly deploys your Todo app and triggers GitHub Actions.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <p className="text-gray-700">
              Linux/Mac versions or additional features (e.g., custom commit messages, selective deployment) are available upon request. Contact the development team for enhancements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Docs;
