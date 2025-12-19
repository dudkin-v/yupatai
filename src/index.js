import { PubSub, PUB_SUB_MESSAGES } from './utils/pubSub.js';
import './components/globalLoader/globalLoader.js';
import './components/navigation/navigation.js';
import './components/header/header.js';
import './styles/main.scss';

PubSub.publish(PUB_SUB_MESSAGES.SHOW_GLOBAL_LOADER, { duration: 1500, animate: false });
document.body.style.opacity = '1';
