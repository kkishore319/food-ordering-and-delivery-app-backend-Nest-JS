import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDto } from './Dto/user.dto';
import { User } from './entities/auth.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private datasource: DataSource) {
    super(User, datasource.createEntityManager());
  }

  async createUser(userDto: UserDto): Promise<string> {
    const { username, password, role, email, phoneNumber, country } = userDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.create({
      username,
      password: hashedPassword,
      role,
      email,
      phoneNumber,
      country,
    });
    try {
      const usr = await this.save(user);
      this.sendEmail(email, 'Welcome to Your Food Ordering App', '');
      return `User with username ${usr.username} is created.`;
    } catch (err) {
      if (err.code == '11000') {
        throw new ConflictException('username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'foodorderingapp12@gmail.com', // My Gmail email address
        pass: 'zajvyfbgjeghwurw', // My Gmail password
      },
    });

    const mailOptions = {
      from: 'foodorderingapp12@gmail.com',
      to,
      subject,
      html: '<h1>Your registration for Food Ordering App is now complete.</h1><h3>\n Thank you for choosing Food Ordering App.\n\n We look forward to serving you soon! </h3><img src="cid:unique@nodemailer.com"/>',
      attachments: [
        {
          filename: 'food.jpg',
          path: 'C:/Users/kikota/Documents/Food Ordering App Nestjs/nest_online_food_ordering/online-food-ordering/src/auth/image/food.jpg',
          cid: 'unique@nodemailer.com',
        },
      ],
    };
    console.log('-----------------------------------------------');

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error occurred:', error.message);
        return;
      }
      console.log('Email sent successfully:', info.response);
    });
  }
}
