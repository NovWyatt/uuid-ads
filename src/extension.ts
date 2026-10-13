import { start } from './scraper';
import { extensionLicenseGate } from './license/gate';

start(extensionLicenseGate());
