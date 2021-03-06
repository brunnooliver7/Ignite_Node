import { UsersRepositoryInMemory } from "@modules/accounts/repositories/in-memory/UsersRepositoryInMemory";
import { UsersTokensRepositoryInMemory } from "@modules/accounts/repositories/in-memory/UsersTokensRepositoryInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DayProvider/implementations/DayjsDateProvider";
import { MailProviderInMemory } from "@shared/container/providers/MailProvider/in-memory/MailProviderInMemory";
import { AppError } from "@shared/errors/AppError";
import { SendForgotPasswordMailUseCase } from "./SendForgotPasswordMailUseCase";

let sendForgotPasswordMailUseCase: SendForgotPasswordMailUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let usersTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
let dateProvider: DayjsDateProvider;
let mailProvider: MailProviderInMemory;

describe("Send Forgot Mail", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    usersTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
    dateProvider = new DayjsDateProvider();
    mailProvider = new MailProviderInMemory();

    sendForgotPasswordMailUseCase = new SendForgotPasswordMailUseCase(
      usersRepositoryInMemory,
      usersTokensRepositoryInMemory,
      dateProvider,
      mailProvider
    );
  });

  it("should be able to send a forgot password mail to user", async () => {
    const sendMail = jest.spyOn(mailProvider, "sendMail");

    await usersRepositoryInMemory.create({
      driver_license: "3512329605",
      email: "tokvuzer@vadinvo.gn",
      name: "Allie Jenkins",
      password: "test",
    });

    await sendForgotPasswordMailUseCase.execute("tokvuzer@vadinvo.gn");

    expect(sendMail).toHaveBeenCalled();
  });

  it("Should not be able to send an email if user does not exists", async () => {
    const sendMail = jest.spyOn(mailProvider, "sendMail");

    await expect(
      sendForgotPasswordMailUseCase.execute("cucok@soson.au")
    ).rejects.toEqual(new AppError("User does not exists"));
  });

  it("Should be able to create a new token to reset password", async () => {
    const generatedToken = jest.spyOn(usersTokensRepositoryInMemory, "create");

    await usersRepositoryInMemory.create({
      driver_license: "3512329605",
      email: "tokvuzer@vadinvo.gn",
      name: "Allie Jenkins",
      password: "test",
    });
    
    await sendForgotPasswordMailUseCase.execute("tokvuzer@vadinvo.gn");

    expect(generatedToken).toHaveBeenCalled();
  });
})