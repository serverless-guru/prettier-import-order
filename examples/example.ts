import React, {
    FC,
    useEffect,
    useRef,
    ChangeEvent,
    KeyboardEvent,
} from 'react';
import { logger } from '@core/logger';
import { reduce, debounce } from 'lodash';
import { Message } from '../Message';
import { createServer } from '@server/node';
import { Alert } from '@ui/Alert';
import { repeat, filter, add } from './utils';
import { initializeApp } from '@core/app';
import { Popup } from '@ui/Popup';
import type { third } from '../hello';
import type { first } from '@server/database';
import type { second } from '../../hello';
