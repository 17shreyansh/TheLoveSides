import type { Request, Response, NextFunction } from 'express';
import { Address } from '../../models/Address.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function listAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const addresses = await Address.find({ userId: req.user!.id }).sort({ isDefault: -1, createdAt: -1 }).lean();
    sendSuccess({ res, data: addresses });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ userId: req.user!.id }, { isDefault: false });
    }

    const address = await Address.create({
      ...req.body,
      userId: req.user!.id,
    });

    // If it's the first address, make it default
    const count = await Address.countDocuments({ userId: req.user!.id });
    if (count === 1 && !isDefault) {
      address.isDefault = true;
      await address.save();
    }

    sendSuccess({ res, data: address, message: 'Address added successfully', statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ userId: req.user!.id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, userId: req.user!.id },
      { $set: req.body },
      { new: true }
    ).lean();

    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    sendSuccess({ res, data: address, message: 'Address updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const address = await Address.findOneAndDelete({ _id: id, userId: req.user!.id });

    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    if (address.isDefault) {
      // Set another address as default if possible
      const nextAddress = await Address.findOne({ userId: req.user!.id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    sendSuccess({ res, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
}
