import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import JSZip from 'jszip';

function zipProjectPlugin(): Plugin {
  return {
    name: 'zip-project-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/download-project-zip') {
          try {
            const zip = new JSZip();
            const rootDir = path.resolve(__dirname);

            const ignoreList = [
              'node_modules',
              '.git',
              'dist',
              '.turbo',
              '.cache',
              '.vscode',
              '.idea',
              '.DS_Store'
            ];

            function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
              const files = fs.readdirSync(dirPath);
              for (const file of files) {
                if (ignoreList.includes(file)) continue;
                const fullPath = path.join(dirPath, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                  const subFolder = zipFolder.folder(file);
                  if (subFolder) addDirectoryToZip(fullPath, subFolder);
                } else {
                  const content = fs.readFileSync(fullPath);
                  zipFolder.file(file, content);
                }
              }
            }

            addDirectoryToZip(rootDir, zip);

            const buffer = await zip.generateAsync({
              type: 'nodebuffer',
              compression: 'DEFLATE',
              compressionOptions: { level: 6 }
            });

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader(
              'Content-Disposition',
              'attachment; filename="party-box-tam-proje.zip"'
            );
            res.end(buffer);
            return;
          } catch (err) {
            console.error('ZIP error:', err);
            res.statusCode = 500;
            res.end('Zip error');
            return;
          }
        } else if (req.url === '/api/download-index-html') {
          try {
            const indexPath = path.resolve(__dirname, 'index.html');
            const content = fs.readFileSync(indexPath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader(
              'Content-Disposition',
              'attachment; filename="index.html"'
            );
            res.end(content);
            return;
          } catch (err) {
            res.statusCode = 500;
            res.end('Error reading index.html');
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), zipProjectPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

