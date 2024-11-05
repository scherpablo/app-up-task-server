"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWT = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '180d'
    });
    return token;
};
exports.generateJWT = generateJWT;
//# sourceMappingURL=jwt.js.map